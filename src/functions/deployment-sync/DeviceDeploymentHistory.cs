// <copyright file="DeviceDeploymentHistory.cs" company="3M">
// Copyright (c) 3M. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Devices.Shared;
using Microsoft.Azure.Documents.SystemFunctions;
using Microsoft.Azure.EventHubs;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Mmm.Iot.Functions.DeploymentSync.Shared;
using Mmm.Iot.Functions.DeploymentSync.Shared.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mmm.Iot.Functions.DeploymentSync
{
    public static class DeviceDeploymentHistory
    {
        public const string FIRMWARE = "Firmware";

        [FunctionName("DeviceDeploymentHistory")]
        public static async Task Run([EventHubTrigger(eventHubName: "twin-change", Connection = "TwinChangeEventHubConnectionString", ConsumerGroup = "%DeviceDeploymentHistoryConsumerGroup%")] EventData[] events, ILogger log)
        {
            bool exceptionOccurred = false;
            List<Task> list = new List<Task>();
            foreach (EventData message in events)
            {
                try
                {
                    message.Properties.TryGetValue("tenant", out object tenant);

                    if (tenant != null)
                    {
                        bool isEdgeEvent = false;
                        string eventData = Encoding.UTF8.GetString(message.Body.Array);
                        Twin twin = JsonConvert.DeserializeObject<Twin>(eventData);
                        TwinServiceModel twinServiceModel = new TwinServiceModel(twin);
                        message.SystemProperties.TryGetValue("iothub-connection-module-id", out object moduleId);
                        if (moduleId != null && !string.IsNullOrEmpty(moduleId.ToString()))
                        {
                            isEdgeEvent = true;
                        }

                        if (!isEdgeEvent)
                        {
                            Dictionary<string, JToken> reportedProperties = twinServiceModel.ReportedProperties;
                            var json = JToken.Parse(JsonConvert.SerializeObject(reportedProperties));
                            var fieldsCollector = new JsonFieldsCollector(json);
                            var fields = fieldsCollector.GetAllFields();
                            bool isFirmWareUpdate = false;
                            foreach (var field in fields)
                            {
                                isFirmWareUpdate = field.Key.Contains(FIRMWARE, StringComparison.OrdinalIgnoreCase);
                                if (isFirmWareUpdate)
                                {
                                    break;
                                }
                            }

                            if (isFirmWareUpdate)
                            {
                                message.SystemProperties.TryGetValue("iothub-connection-device-id", out object deviceId);
                                var newTwin = await TenantConnectionHelper.GetRegistry(Convert.ToString(tenant)).GetTwinAsync(deviceId.ToString());
                                var appliedConfigurations = newTwin.Configurations.Where(c => c.Value.Status.Equals(ConfigurationStatus.Applied));
                                if (appliedConfigurations != null && appliedConfigurations.Count() > 0)
                                {
                                    DeploymentSyncService service = new DeploymentSyncService();
                                    var appliedDeploymentFromStorage = service.GetDeploymentsByIdFromStorage(Convert.ToString(tenant), appliedConfigurations.Select(ac => ac.Key).ToArray()).Result.FirstOrDefault();
                                    await service.SaveDeploymentHistory(Convert.ToString(tenant), appliedDeploymentFromStorage, newTwin);
                                }
                            }
                        }
                        else
                        {
                            message.SystemProperties.TryGetValue("iothub-connection-device-id", out object deviceId);
                            twinServiceModel.ModuleId = (string)moduleId;
                            twinServiceModel.DeviceId = (string)deviceId;
                            Dictionary<string, JToken> reportedProperties = twinServiceModel.ReportedProperties;
                            if (twinServiceModel.ModuleId == "$edgeAgent" && reportedProperties != null && reportedProperties.Count > 0)
                            {
                                var newTwin = await TenantConnectionHelper.GetRegistry(Convert.ToString(tenant)).GetTwinAsync(deviceId.ToString(), moduleId.ToString());
                                var appliedConfigurations = newTwin.Configurations.Where(c => c.Value.Status.Equals(ConfigurationStatus.Applied));
                                if (appliedConfigurations != null && appliedConfigurations.Count() > 0)
                                {
                                    DeploymentSyncService service = new DeploymentSyncService();
                                    var appliedDeploymentFromStorage = service.GetDeploymentsByIdFromStorage(Convert.ToString(tenant), appliedConfigurations.Select(ac => ac.Key).ToArray()).Result.FirstOrDefault();
                                    await service.SaveDeploymentHistory(Convert.ToString(tenant), appliedDeploymentFromStorage, newTwin);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    log.LogError($"Error occurrred : {ex.Message} StackTrace: {ex.StackTrace}  Inner Exception: {(string.IsNullOrEmpty(ex.StackTrace) ? string.Empty : ex.StackTrace)}");
                    exceptionOccurred = true;
                }
            }

            if (exceptionOccurred)
            {
                throw new Exception("Function Failed with exception");
            }
        }
    }
}