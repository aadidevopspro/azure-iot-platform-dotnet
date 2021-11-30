// Copyright (c) Microsoft. All rights reserved.

import React from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { DeviceDetailContainer } from "./deviceDetail/deviceDetail.container";
import { DevicesContainer } from "./devices.container";
import { DeviceTelemetryContainer } from "./deviceTelemetry/deviceTelemetry.container";

export const DevicesRouter = () => (
    <Switch>
        <Route
            exact
            path={"/devices"}
            render={(routeProps) => (
                <DevicesContainer {...routeProps} routeProps={routeProps} />
            )}
        />
        <Route
            exact
            path={"/devices/telemetry"}
            render={(routeProps) => (
                <DeviceTelemetryContainer {...routeProps} />
            )}
        />
        <Route
            exact
            path={"/devices/device-detail"}
            render={(routeProps) => <DeviceDetailContainer {...routeProps} />}
        />
        <Route
            exact
            path={"/devices/device-details/:path(device-deployments|alerts|telemetry)"}
            render={(routeProps) => <DeviceDetailContainer {...routeProps} />}
        />
        <Route
            exact
            path={"/deviceSearch"}
            render={(routeProps) => (
                <DevicesContainer {...routeProps} routeProps={routeProps} />
            )}
        />
        <Route
            exact
            path={"/deviceSearch/telemetry"}
            render={(routeProps) => (
                <DeviceTelemetryContainer {...routeProps} />
            )}
        />
        <Redirect to="/devices" />
    </Switch>
);
