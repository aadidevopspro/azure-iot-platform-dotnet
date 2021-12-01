// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";
import { svgs, renderUndefined } from "utilities";
import {
    Btn,
    ComponentArray,
    ContextMenu,
    ContextMenuAlign,
    PageContent,
    PageTitle,
    StatSection,
    StatGroup,
    StatProperty,
} from "components/shared";
import { toDiagnosticsModel } from "services/models";
import { NavLink } from "react-router-dom";
import { Route, Switch } from "react-router-dom";
import { DeviceDeploymentsContainer } from "./tabs/deviceDeployments/deviceDeployment.container";
import { DeviceAlertsContainer } from "./tabs/deviceAlerts/deviceAlerts.container";
import { TelemetryContainer } from "./tabs/telemetry/telemetry.container";
import { DeviceUploadsContainer } from "./tabs/deviceUploads";
import { DeviceTagsContainer } from "./tabs/deviceTags/deviceTags.container";
const classnames = require("classnames/bind");
const css = classnames.bind(require("./deviceDetail.module.scss"));

export class DeviceDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceId: props.location.state.deviceId,
            device: props.device,
        };
    }

    componentDidMount() {
        console.log(this.state.deviceId);
        console.log(this.props.device);
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
                <PageContent
                    className={`${css("maintenance-container")}  
                    ${css("summary-container")}`}
                >
                    <PageTitle
                        titleValue={this.props.t("devices.details.title")}
                    />
                    <StatSection className={css("summary-stat-container")}>
                        <StatGroup>
                            <StatProperty svg={svgs.devices["generic"]} />
                        </StatGroup>
                        <StatGroup>
                            <StatProperty
                                value={renderUndefined(this.props.device.id)}
                            />
                        </StatGroup>
                        <StatGroup>
                            <StatProperty
                                value={
                                    this.props.device.isSimulated
                                        ? t("devices.flyouts.details.simulated")
                                        : t(
                                              "devices.flyouts.details.notSimulated"
                                          )
                                }
                            />
                        </StatGroup>
                        <StatGroup>
                            <StatProperty
                                value={
                                    this.props.device.connected
                                        ? t("devices.flyouts.details.connected")
                                        : t(
                                              "devices.flyouts.details.notConnected"
                                          )
                                }
                            />
                        </StatGroup>
                    </StatSection>
                    <div className={css("tab-container")}>
                        <NavLink
                            to={{
                                pathname: "/devices/device-details/alerts",
                                state: { deviceId: this.state.deviceId },
                            }}
                            className={css("tab")}
                            activeClassName={css("active")}
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
                            className={css("tab")}
                            activeClassName={css("active")}
                            onClick={this.tabClickHandler.bind(
                                this,
                                "TelemetryTab"
                            )}
                        >
                            {this.props.t("devices.details.telemetry.title")}
                        </NavLink>
                        <NavLink
                            to={{
                                pathname: "/devices/device-details/tags",
                                state: { deviceId: this.state.deviceId },
                            }}
                            className={css("tab")}
                            activeClassName={css("active")}
                            onClick={this.tabClickHandler.bind(this, "TagsTab")}
                        >
                            {this.props.t("devices.details.tags.title")}
                        </NavLink>
                        <NavLink
                            to={{
                                pathname:
                                    "/devices/device-details/device-uploads",
                                state: { deviceId: this.state.deviceId },
                            }}
                            className={css("tab")}
                            activeClassName={css("active")}
                            onClick={this.tabClickHandler.bind(
                                this,
                                "DeviceUploadsTab"
                            )}
                        >
                            {this.props.t(
                                "devices.details.deviceUploads.title"
                            )}
                        </NavLink>
                        <NavLink
                            to={{
                                pathname:
                                    "/devices/device-details/device-deployments",
                                state: { deviceId: this.state.deviceId },
                            }}
                            className={css("tab")}
                            activeClassName={css("active")}
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
                                path={"/devices/device-details/device-uploads"}
                                render={() => (
                                    <DeviceUploadsContainer
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
                            <Route
                                exact
                                path={"/devices/device-details/tags"}
                                render={() => (
                                    <DeviceTagsContainer
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
