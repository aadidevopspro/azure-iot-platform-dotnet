param(
     [string] $servicePrincipalId,
     [string] $servicePrincipalKey,
     [string] $tenantId,
     [string] $subscriptionId,
     [string] $applicationCode,
     [string] $environmentCategory,
     [string] $resourceGroupName,
     [string] $location,
     [string] $appConfigurationName,
     [string] $keyvaultName
)

function Get-GrafanaApiKey {
     param(
          [string] $keyvaultName,
          [string] $tenantId
     )
     $orgKeyName = "Grafana--"+ $tenantId +"--APIKey"

     try {

          $keyResult=Get-AzKeyVaultSecret -VaultName $keyvaultName -Name $orgKeyName -AsPlainText

          return $keyResult
     }
     catch {
          Write-Host("An Error occured.")
          Write-Host($_)
     }
}

function Get-GrafanaOrg {
     param(
          [string] $tenantId,
          [string] $appConfigurationName
     )
     Write-Host $appConfigurationName
     $keyName = "tenant:"+$tenantId+":grafanaOrgId"
     Write-Host $keyName
     try {
          $keyResult=(az appconfig kv list --name $appConfigurationName --key $keyName | ConvertFrom-Json)[0]
          Write-Host $keyResult
          return $keyResult.value
     }
     catch {
          Write-Host("An Error occured.")
          Write-Host($_)
     }
}


function New-EdgeDashboard {
     param(
          [string] $applicationCode,
          [string] $environmentCategory,
          [string] $resourceGroup,
          [string] $subscriptionId, 
          [string] $grafanabaseurl,
          [string] $apptenantId,
          [string] $grafanaApiKey,
          [string] $orgId
     )

     # creation of Edge Dashboard for Tenant

     $tenantSubString = $apptenantId.Split("-")[0]
     $appConfigurationName = $applicationCode + "-appconfig-" + $environmentCategory

     $dashboardContent = Get-Content '.\pipelines\cd\GrafanaMigration\sample-edge-dashboard.json' -raw 

     
     $dashboardContent = $dashboardContent -replace '\{0\}' , $subscriptionId
     $dashboardContent = $dashboardContent -replace '\{1\}' , $resourceGroup
     $dashboardContent = $dashboardContent -replace '\{2\}' , ($applicationCode + "-loganalyticsws-" + $environmentCategory)
     $dashboardContent = $dashboardContent -replace '\{3\}' , $grafanabaseurl
     $dashboardContent = $dashboardContent -replace '\{4\}' , ($tenantSubString + "-edge")     
     $dashboardContent = $dashboardContent -replace '\{5\}' , ($tenantSubString + "-EdgeDashboard")
     $dashboardContent = $dashboardContent -replace '\{6\}' , $orgId


     $body = $dashboardContent | ConvertFrom-Json | ConvertTo-Json -Depth 32

     $uri = $grafanabaseurl + "/api/dashboards/db"
     $headers = @{
          'Authorization' = "Bearer " + $grafanaApiKey
          'Content-Type'  = 'application/json'
     }

     try {
          Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
          az appconfig kv set --name $appConfigurationName --key ("tenant:"+$apptenantId+":edgeGrafanaUrl") --value ($tenantSubString + "-edge/" + $tenantSubString + "-EdgeDashboard") --yes
          }
     catch {
          Write-Host("An Error occured.")
          Write-Host($_)
     }

}

try {       
     $grafanabaseurl = "https://$applicationCode-aks-$environmentCategory.$location.cloudapp.azure.com/grafana"
     $resourceGroupName = $resourceGroup
     $storageAccountName = $applicationCode + "storageacct" + $environmentCategory
     $keyvaultName = $applicationCode + "-keyvault-" + $environmentCategory
     $appConfigurationName = $applicationCode + "-appconfig-" + $environmentCategory

     #remove and reisntall pkmngr and install packages
     #Register-PackageSource -Name MyNuGet -Location https://www.nuget.org/api/v2 -ProviderName NuGet
     Install-Module -Name AzTable -Force

     Write-Host "############## Installed AzTable successfully."

     az cloud set -n AzureCloud
     az login --service-principal -u $servicePrincipalId --password $servicePrincipalKey --tenant $tenantId --allow-no-subscriptions
     az account set --subscription $subscriptionId

     $cloudTable = (Get-AzStorageAccount -ResourceGroupName $resourceGroupName -Name $storageAccountName).Context
     $tableObject = (Get-AzStorageTable -Name "tenant" -Context $cloudTable).CloudTable
     $iotHubArray = (Get-AzTableRow -table $tableObject -CustomFilter 'IsIotHubDeployed eq true')
     
     Foreach ($iotHub in $iotHubArray) {
          $iotTenantId = $iotHub.TenantId  

          Write-Host $iotTenantId

          #Get OrgId for Tenant
          $orgId = Get-GrafanaOrg -appConfigurationName $appConfigurationName `
               -tenantId $iotTenantId
			   
          if(![string]::IsNullOrWhiteSpace($orgId)){
          Write-Host "Retrieved OrgId for Tenant:"$iotTenantId "is" $orgId

          # Get API Key for Org
          $grafanaApiKey = Get-GrafanaApiKey -keyvaultName $keyvaultName `
               -tenantId $iotTenantId

          Write-Host "Retrieved APIKey for Org with Org Id:"$orgId "is" $grafanaApiKey

          # Create Edge Dashboard for each tenant.
          New-EdgeDashboard -applicationCode $applicationCode `
                          -environmentCategory $environmentCategory `
                          -resourceGroup $resourceGroupName `
                          -subscriptionId $subscriptionId `
                          -grafanabaseurl $grafanabaseurl `
                          -apptenantId $iotHub.TenantId `
                          -grafanaApiKey $grafanaApiKey `
                          -orgId $orgId
          Write-Host "Created Edge Dashboard for Tenant:"  $iotTenantId       
     }
     }
}
catch {
     Write-Host("An Error occured.")
     Write-Host($_)
}


