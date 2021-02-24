// <copyright file="TenantConnectionHelper.cs" company="3M">
// Copyright (c) 3M. All rights reserved.
// </copyright>

using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Devices;
using Microsoft.Extensions.Logging;
using Mmm.Iot.Common.Services;
using Mmm.Iot.Common.Services.Exceptions;
using Mmm.Iot.Common.Services.External.AppConfiguration;

namespace Mmm.Iot.IoTHubManager.Services.Helpers
{
    public class TenantConnectionHelper : ITenantConnectionHelper
    {
        private const string TenantKey = "tenant:";
        private const string IotHubConnectionKey = ":iotHubConnectionString";
        private readonly IAppConfigurationClient appConfig;
        private readonly ILogger<TenantConnectionHelper> logger;
        private readonly IHttpContextAccessor httpContextAccessor;

        public TenantConnectionHelper(
            IAppConfigurationClient appConfigurationClient,
            IHttpContextAccessor httpContextAccessor,
            ILogger<TenantConnectionHelper> logger)
        {
            this.httpContextAccessor = httpContextAccessor;
            this.appConfig = appConfigurationClient;
            this.logger = logger;
        }

        // Gets the tenant name from the threads current token.
        public string TenantId
        {
            get
            {
                return this.httpContextAccessor.HttpContext.Request.GetTenant();
            }
        }

        public string GetIotHubConnectionString()
        {
            var appConfigurationKey = TenantKey + this.TenantId + IotHubConnectionKey;
            this.logger.LogDebug("App Configuration key for IoT Hub connection string for tenant {tenant} is {appConfigurationKey}", this.TenantId, appConfigurationKey);
            /*return "HostName=classicdeploymentshub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=fOdAYtoz2NGge6ssjp0ksnrV4Fv3xd6Hg+U2VjVG95E=";*/
            return "HostName=ragav-test.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=XL6M6N90gGs2q7vGcnarGgFJtzTGzJ3wuhpxZx+CYR8=";
        }

        public string GetIotHubConnectionStringForJobs()
        {
            var appConfigurationKey = TenantKey + this.TenantId + IotHubConnectionKey;
            this.logger.LogDebug("App Configuration key for IoT Hub connection string for tenant {tenant} is {appConfigurationKey}", this.TenantId, appConfigurationKey);
            /*return "HostName=deploymentswithjobshub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=L6NYDeXhF8K1So0fXVcjHx/HUhuu/SKl31AiUViyaF0=";*/
            return "HostName=ragav-test.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=XL6M6N90gGs2q7vGcnarGgFJtzTGzJ3wuhpxZx+CYR8=";
        }

        public string GetIotHubName()
        {
            string currIoTHubHostName = null;
            IoTHubConnectionHelper.CreateUsingHubConnectionString(this.GetIotHubConnectionString(), (conn) =>
            {
                currIoTHubHostName = IotHubConnectionStringBuilder.Create(conn).HostName;
            });
            if (currIoTHubHostName == null)
            {
                throw new InvalidConfigurationException($"Invalid tenant information for HubConnectionstring.");
            }

            return currIoTHubHostName;
        }

        public RegistryManager GetRegistry()
        {
            RegistryManager registry = null;

            IoTHubConnectionHelper.CreateUsingHubConnectionString(this.GetIotHubConnectionString(), (conn) =>
            {
                registry = RegistryManager.CreateFromConnectionString(conn);
            });
            if (registry == null)
            {
                throw new InvalidConfigurationException($"Invalid tenant information for HubConnectionstring.");
            }

            return registry;
        }

        public RegistryManager GetRegistryForJobs()
        {
            RegistryManager registry = null;

            IoTHubConnectionHelper.CreateUsingHubConnectionString(this.GetIotHubConnectionStringForJobs(), (conn) =>
            {
                registry = RegistryManager.CreateFromConnectionString(conn);
            });
            if (registry == null)
            {
                throw new InvalidConfigurationException($"Invalid tenant information for HubConnectionstring.");
            }

            return registry;
        }

        public JobClient GetJobClient()
        {
            JobClient job = null;

            IoTHubConnectionHelper.CreateUsingHubConnectionString(this.GetIotHubConnectionStringForJobs(), conn =>
             {
                 job = JobClient.CreateFromConnectionString(conn);
             });
            if (job == null)
            {
                throw new InvalidConfigurationException($"Invalid tenant information for HubConnectionstring.");
            }

            return job;
        }
    }
}