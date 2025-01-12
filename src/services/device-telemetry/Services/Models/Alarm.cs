// <copyright file="Alarm.cs" company="3M">
// Copyright (c) 3M. All rights reserved.
// </copyright>

using System;
using Microsoft.Azure.Documents;

namespace Mmm.Iot.DeviceTelemetry.Services.Models
{
    public class Alarm
    {
        public Alarm()
        {
        }

        public Alarm(
            string etag,
            string id,
            long dateCreated,
            long dateModified,
            string description,
            string groupId,
            string deviceId,
            string status,
            string ruleId,
            string ruleSeverity,
            string ruleDescription)
        {
            this.ETag = etag;
            this.Id = id;
            this.DateCreated = DateTimeOffset.FromUnixTimeMilliseconds(dateCreated);
            this.DateModified = DateTimeOffset.FromUnixTimeMilliseconds(dateModified);
            this.Description = description;
            this.GroupId = groupId;
            this.DeviceId = deviceId;
            this.Status = status;
            this.RuleId = ruleId;
            this.RuleSeverity = ruleSeverity;
            this.RuleDescription = ruleDescription;
        }

        public Alarm(Document doc)
        {
            if (doc != null)
            {
                this.ETag = doc.ETag;
                this.Id = doc.Id;
                this.DateCreated = DateTimeOffset.FromUnixTimeMilliseconds(doc.GetPropertyValue<long>("created"));
                this.DateModified = DateTimeOffset.FromUnixTimeMilliseconds(doc.GetPropertyValue<long>("modified"));
                this.Description = doc.GetPropertyValue<string>("description");
                this.GroupId = doc.GetPropertyValue<string>("groupId");
                this.DeviceId = doc.GetPropertyValue<string>("deviceId");
                this.Status = doc.GetPropertyValue<string>("status");
                this.RuleId = doc.GetPropertyValue<string>("ruleId");
                this.RuleSeverity = doc.GetPropertyValue<string>("ruleSeverity");
                this.RuleDescription = doc.GetPropertyValue<string>("ruleDescription");
            }
        }

        public string ETag { get; set; }

        public string Id { get; set; }

        public DateTimeOffset DateCreated { get; set; }

        public DateTimeOffset DateModified { get; set; }

        public string Description { get; set; }

        public string GroupId { get; set; }

        public string DeviceId { get; set; }

        public string Status { get; set; }

        public string RuleId { get; set; }

        public string RuleSeverity { get; set; }

        public string RuleDescription { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether alarm is deleted.
        /// This is alerts ADX table property.
        /// </summary>
        public bool IsDeleted { get; set; }
    }
}