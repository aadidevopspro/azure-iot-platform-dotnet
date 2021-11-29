// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";
import { Subject } from "rxjs";
import { rulesColumnDefs } from "components/pages/rules/rulesGrid";
import { svgs } from "utilities";
import {
    Btn,
    ComponentArray,
    ContextMenu,
    ContextMenuAlign,
    PageContent,
    PageTitle,
} from "components/shared";
import { toDiagnosticsModel } from "services/models";
import "./deviceDetail.scss";
import { NavLink } from "react-router-dom";

export class DeviceDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: undefined,
            isAlertsPending: false,
            alertsError: undefined,

            telemetry: {},
            telemetryIsPending: true,
            telemetryError: null,
            telemetryQueryExceededLimit: false,

            showRawMessage: false,
            currentModuleStatus: undefined,
            deviceUploads: undefined,
            deviceDeployments: undefined,
            expandedValue: false,
            deviceId: props.location.state.deviceId,
        };
        this.baseState = this.state;
        this.columnDefs = [
            {
                ...rulesColumnDefs.ruleName,
                cellRendererFramework: undefined, // Don't allow soft select from an open flyout
            },
            rulesColumnDefs.severity,
            rulesColumnDefs.alertStatus,
            rulesColumnDefs.explore,
        ];

        this.resetTelemetry$ = new Subject();
        this.telemetryRefresh$ = new Subject();
        if (this.props.moduleStatus) {
            this.state = {
                ...this.state,
                currentModuleStatus: this.props.moduleStatus,
            };
        } else {
            this.props.fetchModules(this.state.deviceId);
        }
    }

    tabClickHandler = (tabName) => {
        this.props.logEvent(toDiagnosticsModel(tabName + "_Click", {}));
    };

    navigateToDevices = () => {
        this.props.history.push("/devices");
    };

    render() {
        const { t } = this.props;
        return (
            <ComponentArray>
                <ContextMenu>
                    <ContextMenuAlign left={true}>
                        <Btn svg={svgs.return} onClick={this.navigateToDevices}>
                            {t("devices.returnToDevices")}
                        </Btn>
                    </ContextMenuAlign>
                </ContextMenu>

                <PageContent className="maintenance-container summary-container">
                    <PageTitle
                        titleValue={this.props.t("devices.details.title")}
                    />
                    <div className="tab-container">
                        
                    <NavLink
                            to={"/devices/device-details/tags"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(this, "JobsTab")}
                        >
                        {this.props.t("devices.details.alerts.title")}
                        </NavLink>
                        <NavLink
                            to={"/devices/device-details/telemetry"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(
                                this,
                                "AlertsTab"
                            )}
                        >
                            {this.props.t("devices.details.telemetry.title")}
                        </NavLink>
                        <NavLink
                            to={"/devices/device-details/tags"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(this, "JobsTab")}
                        >
                        {this.props.t("devices.details.tags.title")}
                        </NavLink>
                        <NavLink
                            to={"/devices/device-details/tags"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(this, "JobsTab")}
                        >
                        {this.props.t("devices.details.methods.title")}
                        </NavLink>
                        <NavLink
                            to={"/devices/device-details/tags"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(this, "JobsTab")}
                        >
                        {this.props.t("devices.details.properties.title")}
                        </NavLink>
                        <NavLink
                            to={"/devices/device-details/tags"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(this, "JobsTab")}
                        >
                        {this.props.t("devices.details.diagnostics.title")}
                        </NavLink>
                        <NavLink
                            to={"/devices/device-details/tags"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(this, "JobsTab")}
                        >
                        {this.props.t("devices.details.modules.title")}
                        </NavLink>
                        <NavLink
                            to={"/devices/device-details/tags"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(this, "JobsTab")}
                        >
                        {this.props.t("devices.details.deviceUploads.title")}
                        </NavLink>
                        <NavLink
                            to={"/devices/device-details/tags"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(this, "JobsTab")}
                        >
                        {this.props.t("devices.details.deviceDeployments.title")}
                        </NavLink>
                    </div>
                </PageContent>
            </ComponentArray>
        );
    }
}
