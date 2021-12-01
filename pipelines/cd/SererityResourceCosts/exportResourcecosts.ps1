param(
     [string] $applicationShortCode,
     [string] $environmentCategory,
     [string] $subscriptionId
)

try {
     Install-Module -Name AzTable -Force
   $global:subConsumptionUsage=[System.Collections.ArrayList]@()
   $global:customerResourceGroups=[System.Collections.ArrayList]@()
   $global:summaryCosts=@()
   $global:serenityResourceGroups=[System.Collections.ArrayList]@()
   $global:serenityEnvCostSpent =$null
   $global:deviceDataArray=[System.Collections.ArrayList]@()
   $global:totalCost=$null
   $global:activeDevices=$null
   $global:registeredDevices=$null
   $global:subscriptionResourceGroupLevelArray=[System.Collections.ArrayList]@()
   $global:subscriptionDataObjectArray=[System.Collections.ArrayList]@()

# Get the ConsumptionUsage Monthly and Yearly
#perfect working
  function Get-ConsumptionUsage {
        Write-Host "Function Call : Get-ConsumptionUsage..............."
        $now = get-Date
        $startDate = $($now.Date.AddDays(-30))
        $endDate = $($now.Date.AddDays(0))
        $global:subConsumptionUsage = Get-AzConsumptionUsageDetail -StartDate $startDate  -EndDate $endDate
        $global:subConsumptionUsage | ForEach-Object { if ( $_.InstanceId -ne $null){ $global:totalCost += $_.PretaxCost }   }

   }
# Get the Serenity Specific ResourceGroups
  
  function Get-SerenityResources {
        Write-Host "Function Call : Get-SerenityResources..............."
        $resourceGroups=[System.Collections.ArrayList]@()
        $subIdPrefix = "/subscriptions/" + $subscriptionId
        $rgIdPrefix = $subIdPrefix + "/resourceGroups/"

        foreach ($line in $global:subConsumptionUsage) {
            if ($line.InstanceId -ne $null ) {
                $rgGroupName = $($line.InstanceId.ToLower()).Replace($rgIdPrefix.ToLower(),"")
                $rgGroupName = $rgGroupName.Split("/")[0]
                $rgGroupName = $rgGroupName.ToString()
                $rgGroupName = $rgGroupName.ToLower()
                $rgGroupName = $rgGroupName.Trim()

                if ($resourceGroups.ResourceGroup -notcontains $rgGroupName) {
                    $resourceGroupName = [PSCustomObject]@{
                    Customer = $applicationShortCode.ToUpper();
                    Environment = $environmentCategory.ToUpper();
                    Lookup = $applicationShortCode.ToUpper()+"-"+$environmentCategory.ToUpper();
                    ResourceGroup = $rgGroupName
                    }
                    $resourceGroups += $resourceGroupName
                }
            }
        }
        foreach ($rg in $resourceGroups) {
            $rgIdPrefix = $subIdPrefix + "/resourceGroups/" + $rg.ResourceGroup
            $monthlyRgCost = $null
            $global:subConsumptionUsage | ? { if ( $_.InstanceId -ne $null) { $($_.InstanceId.ToLower()).StartsWith($rgIdPrefix.ToLower()) } } |  ForEach-Object { $monthlyRgCost += $_.PretaxCost   }
            $monthlyRgCost = [math]::Round($monthlyRgCost,2)
            $rg | Add-Member -MemberType NoteProperty -Name "MonthlyCost" -Value $monthlyRgCost
            $yearlyRgCost = $monthlyRgCost*12
            $rg | Add-Member -MemberType NoteProperty -Name "YearlyCost" -Value $yearlyRgCost

            if($rg.ResourceGroup -ne "") {
                $global:customerResourceGroups +=$rg    
            }
        }
            $global:customerResourceGroups | ? { if ( $_.ResourceGroup -ne $null) { $($_.ResourceGroup.ToLower()).Contains("rg-iot") } } |  ForEach-Object { $global:serenityEnvCostSpent += $_.MonthlyCost;$global:serenityResourceGroups += $_.ResourceGroup   }    
}

 # Get the SummaryCosts of all environments
    function Get-SummaryCosts
    {
        Write-Host "Function Call : Get-SummaryCosts..............."
        $devicesCount=$null
        $global:deviceDataArray | ForEach-Object { $deviceCount += $_.RegisteredDevices }
        $summaryObject = [PSCustomObject]@{
                    Customer = $applicationShortCode.ToUpper();
                    Environment = $environmentCategory.ToUpper();
                    CustomerEnv = $applicationShortCode.ToUpper()+"-"+$environmentCategory.ToUpper()
                    Devices = $deviceCount 
                    SerenityMonthlySpend = $global:serenityEnvCostSpent
                    SerenityYearlySpend = $global:serenityEnvCostSpent * 12
                    SubscriptionMonthlySpend = $global:totalCost
                    SubscriptionYearlySpend = $global:totalCost * 12
                    DifferenceMonthly = $global:totalCost - $global:serenityEnvCostSpent
                    DifferenceYearly = ($global:totalCost - $global:serenityEnvCostSpent)*12
                    }
        $global:summaryCosts +=$summaryObject
    }
# Get all the device details of all environments
    function Get-DeviceDetails
    {
        Write-Host "Function Call : Get-DeviceDetails..............."
        $deviceDataArray=$null
        $iotHubArray=@()
        foreach($rg in $global:serenityResourceGroups)
        {
          $iotHubArray=@()
          $iotHubArray=(Get-AzIotHub -ResourceGroupName $rg).Name
          if($iotHubArray.Count -ge 0)
          {
             foreach($iothub in $iotHubArray){
                $activeDevices=((Get-AzIotHubDevice -ResourceGroupName $rg -IotHubName $iothub) | Where-Object {$_.ConnectionState -eq "Connected"}).Count
                $registeredDevices=((Get-AzIotHubDevice -ResourceGroupName $rg -IotHubName $iothub)).Count
                $DeviceDataObject= New-Object PSObject
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "Customer" -Value $applicationShortCode
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "Environment" -Value $environmentCategory
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "LookUp" -Value $applicationShortCode-$environmentCategory
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "IotHub" -Value $iothub
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "ResourceGroup" -Value $rg
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "RecordedOn" -Value (Get-Date -Format "MM/dd/yyyy")
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "ActiveDevices" -Value $activeDevices
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "RegisteredDevices" -Value $registeredDevices
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "Notes" -Value ""
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "NonProd" -Value $(If (($environmentCategory -eq "DEV") -or ($environmentCategory -eq "QA") ) { $activeDevices+$registeredDevices } Else { $null })
                $DeviceDataObject | Add-Member -MemberType NoteProperty -Name "Prod" -Value $(If (($environmentCategory -eq "CT") -or ($environmentCategory -eq "PROD") -or ($environmentCategory -eq "WKBNCH")) { $activeDevices+$registeredDevices } Else { $null })
                Write-Host "The following iothub: $iothub contains $DeviceDataObject "
                Write-Host "The following are activeDevices and registeredDevices are: $activeDevices and $registeredDevices"
                $global:deviceDataArray +=$DeviceDataObject
                $global:activeDevices +=$activeDevices
                $global:registeredDevices +=$registeredDevices 
             }
          }           
        }
    }    
    #Get the subscription Details of all environments
    function Get-SubscriptionDataDetails{
        
        Write-Host "Function Call : Get-SubscriptionDataDetails..............."
        $storageAccountName=$applicationShortCode+"iot"+"storageacct"+$environmentCategory
        $resourceGroupName = "rg-iot-"+ $applicationShortCode+"-"+ $environmentCategory
        $storageAccountContext = (Get-AzStorageAccount -ResourceGroupName $resourceGroupName -Name $storageAccountName).Context
        $cloudTable = (Get-AzStorageTable -Name "tenant" -Context $storageAccountContext).CloudTable
        $tenantCount = (Get-AzTableRow -table $cloudTable -CustomFilter 'IsIotHubDeployed eq true').Count
        $location = $(If (($environmentCategory -eq "eu") ) { "westeurope" } Else { "centralus" })
        $subscriptionDataObject = [PSCustomObject]@{
                    Customer = $applicationShortCode;
                    Environment = $environmentCategory;
                    CustomerEnv = $applicationShortCode+"-"+$environmentCategory
                    Link = "https://$applicationShortCode"+"iot-aks-"+"$environmentCategory."+"$location."+"cloudapp.azure.com"
                    Notes = "" 
                    TenantCount= $tenantCount 
                    SubscriptionMonthlyConsumption = $global:totalCost
                    SubscriptionYearlyConsumption = $global:totalCost * 12
                    ActiveDeviceCount = $global:activeDevices
                    RegisteredDeviceCount = $global:registeredDevices
        }
        $global:subscriptionDataObjectArray+=$subscriptionDataObject
    }
# Get the Resource Group Level Subscription Data Details of all environments
    function Get-ResourceGroupLevelSubscriptionDataDetails{
      Write-Host "Function Call : Get-ResourceGroupLevelSubscriptionDataDetails..............."

        foreach($rg in $global:serenityResourceGroups)
        {
           if($rg.StartsWith("rg-iot-") -eq "True")
           {
             $env=$rg.Split("-")[3] 
             $storageAccountName=$rg.Split("-")[2] +"iot"+"storageacct"+$env
             $storageAccountContext = (Get-AzStorageAccount -ResourceGroupName $rg -Name $storageAccountName).Context
             $cloudTable = (Get-AzStorageTable -Name "tenant" -Context $storageAccountContext).CloudTable
             $tenantCount = (Get-AzTableRow -table $cloudTable -CustomFilter 'IsIotHubDeployed eq true').Count 
             $location = $(If (($env -eq "eu") ) { "westeurope" } Else { "centralus" })
             $subscriptionDataObject = [PSCustomObject]@{
                    Customer = $applicationShortCode.ToUpper();
                    Environment = $env.ToUpper();
                    CustomerEnv = $applicationShortCode.ToUpper()+"-"+$env.ToUpper()
                    Link = "https://$applicationShortCode"+"iot-aks-"+"$env."+"$location."+"cloudapp.azure.com"
                    Notes = "" 
                    TenantCount= $tenantCount
                    SubscriptionMonthlyConsumption = $global:totalCost
                    SubscriptionYearlyConsumption = $global:totalCost * 12
                    ActiveDeviceCount = $global:activeDevices
                    RegisteredDeviceCount = $global:registeredDevices
                }
              $global:subscriptionResourceGroupLevelArray+=$subscriptionDataObject  
           }
        }
    }


 # Export the Serenity Costs 
function Export-ResourceCosts {
Write-Host "Function Call : ExportResourceCosts..............."
$name=$applicationShortCode+$environmentCategory
        $global:customerResourceGroups | Export-Csv -Path "ResourceGroupData-$name.csv" -NoTypeInformation
        $global:summaryCosts | Export-Csv -Path "Summary-$name.csv" -NoTypeInformation
        $global:deviceDataArray | Export-Csv -Path "DeviceData-$name.csv" -NoTypeInformation
        $global:subscriptionResourceGroupLevelArray | Export-Csv -Path "SubscriptionResourceGroupData-$name.csv" -NoTypeInformation
        $global:subscriptionDataObjectArray | Export-Csv -Path "SubscriptionData-$name.csv" -NoTypeInformation

}

Get-ConsumptionUsage
Get-SerenityResources
Get-DeviceDetails
Get-SummaryCosts
Get-SubscriptionDataDetails
Get-ResourceGroupLevelSubscriptionDataDetails
Export-ResourceCosts
}
catch {
      Write-Host("An Error occured.")
      Write-Host($_)
  } 