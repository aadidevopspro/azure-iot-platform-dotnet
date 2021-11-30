// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";
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
import { Route, Switch } from "react-router-dom";
import { DeviceDeploymentsContainer } from "./tabs/deviceDeployment.container";
import { DeviceAlertsContainer } from "./tabs/deviceAlerts/deviceAlerts.container";
import { TelemetryContainer } from "./tabs/telemetry/telemetry.container";

export class DeviceDetail extends Component {
    constructor(props) {
        super(props);
        debugger;
        this.state = {
            deviceId: props.location.state.deviceId,
        };
    }

    componentDidMount() {
        console.log(this.state.deviceId);
    }

    tabClickHandler = (tabName) => {
        const { logEvent } = this.props;
        logEvent(toDiagnosticsModel(tabName + "_Click", {}));
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
                            to={{
                                pathname: "/devices/device-details/alerts",
                                state: { deviceId: this.state.deviceId },
                            }}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(
                                this,
                                "DeviceAlertsTab"
                            )}
                        >
                            {this.props.t("devices.details.alerts.title")}
                        </NavLink>
                        <NavLink
                            to={{
                                pathname: "/devices/device-details/telemetry",
                                state: { deviceId: this.state.deviceId },
                            }}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(
                                this,
                                "TelemetryTab"
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
                            {this.props.t(
                                "devices.details.deviceUploads.title"
                            )}
                        </NavLink>
                        <NavLink
                            to={"/devices/device-details/device-deployments"}
                            className="tab"
                            activeClassName="active"
                            onClick={this.tabClickHandler.bind(
                                this,
                                "DeviceDeploymentsTab"
                            )}
                        >
                            {this.props.t(
                                "devices.details.deviceDeployments.title"
                            )}
                        </NavLink>
                    </div>
                    <div className="grid-container">
                        <Switch>
                            <Route
                                exact
                                path={"/devices/device-details/alerts"}
                                render={() => (
                                    <DeviceAlertsContainer
                                        deviceId={this.state.deviceId}
                                    />
                                )}
                            />
                            <Route
                                exact
                                path={"/devices/device-details/telemetry"}
                                render={() => (
                                    <TelemetryContainer
                                        deviceId={this.state.deviceId}
                                    />
                                )}
                            />
                            <Route
                                exact
                                path={
                                    "/devices/device-details/device-deployments"
                                }
                                render={() => (
                                    <DeviceDeploymentsContainer
                                        deviceId={this.state.deviceId}
                                    />
                                )}
                            />
                        </Switch>
                    </div>
                </PageContent>
            </ComponentArray>
        );
    }
}
