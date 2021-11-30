// Copyright (c) Microsoft. All rights reserved.

import React, { Component, Fragment } from "react";
import { merge, of, Subject } from "rxjs";
import { delay, map, mergeMap, switchMap, tap } from "rxjs/operators";
import Config from "app.config";
import { TelemetryService } from "services";
import { int } from "utilities";
import { TimeSeriesInsightsLinkContainer } from "components/shared";
import { TimeIntervalDropdownContainer as TimeIntervalDropdown } from "components/shell/timeIntervalDropdown";
import {
    TelemetryChartContainer as TelemetryChart,
    chartColorObjects,
} from "components/pages/dashboard/panels/telemetry";
import { transformTelemetryResponse } from "components/pages/dashboard/panels";

export class Telemetry extends Component {
    constructor(props) {
        super(props);

        this.state = {
            telemetry: {},
            telemetryIsPending: true,
            telemetryError: null,
            telemetryQueryExceededLimit: false,
        };
        this.baseState = this.state;
        this.resetTelemetry$ = new Subject();
        this.telemetryRefresh$ = new Subject();
    }

    componentDidMount() {
        debugger;
        const {
                device = {},
                device: { telemetry: { interval = "0" } = {} } = {},
            } = this.props,
            deviceId = device.id;

        const [hours = 0, minutes = 0, seconds = 0] = interval
                .split(":")
                .map(int),
            refreshInterval = ((hours * 60 + minutes) * 60 + seconds) * 1000,
            // Telemetry stream - START
            onPendingStart = () => this.setState({ telemetryIsPending: true }),
            telemetry$ = this.resetTelemetry$.pipe(
                tap((_) => this.setState({ telemetry: {} })),
                switchMap(
                    (deviceId) =>
                        merge(
                            TelemetryService.getTelemetryByDeviceId(
                                [deviceId],
                                TimeIntervalDropdown.getTimeIntervalDropdownValue()
                            ).pipe(
                                mergeMap((items) => {
                                    this.setState({
                                        telemetryQueryExceededLimit:
                                            items.length >= 1000,
                                    });
                                    return of(items);
                                })
                            ),
                            this.telemetryRefresh$.pipe(
                                // Previous request complete
                                delay(
                                    refreshInterval ||
                                        Config.dashboardRefreshInterval
                                ), // Wait to refresh
                                tap(onPendingStart),
                                mergeMap((_) =>
                                    TelemetryService.getTelemetryByDeviceIdP1M([
                                        deviceId,
                                    ])
                                )
                            )
                        ).pipe(
                            mergeMap((messages) =>
                                transformTelemetryResponse(
                                    () => this.state.telemetry
                                )(messages).pipe(
                                    map((telemetry) => ({
                                        telemetry,
                                        lastMessage: messages[0],
                                    }))
                                )
                            ),
                            map((newState) => ({
                                ...newState,
                                telemetryIsPending: false,
                            }))
                        ) // Stream emits new state
                )
            );
        // Telemetry stream - END

        this.telemetrySubscription = telemetry$.subscribe(
            (telemetryState) =>
                this.setState(telemetryState, () =>
                    this.telemetryRefresh$.next("r")
                ),
            (telemetryError) =>
                this.setState({ telemetryError, telemetryIsPending: false })
        );

        this.resetTelemetry$.next(deviceId);
    }

    componentWillReceiveProps(nextProps) {
        const { resetPendingAndError, device } = nextProps;
        let tempState = {};

        if ((this.props.device || {}).id !== device.id) {
            // Reset state if the device changes.
            resetPendingAndError();
            tempState = { ...this.baseState };

            const deviceId = (device || {}).id;
            this.resetTelemetry$.next(deviceId);
        }
        if (Object.keys(tempState).length) {
            this.setState(tempState);
        }
    }

    componentWillUnmount() {
        this.telemetrySubscription.unsubscribe();
    }

    toggleRawDiagnosticsMessage = () => {
        this.setState({ showRawMessage: !this.state.showRawMessage });
    };

    updateTimeInterval = (timeInterval) => {
        this.props.updateTimeInterval(timeInterval);
        this.resetTelemetry$.next(this.props.device.id);
    };

    expandFlyout() {
        if (this.state.expandedValue) {
            this.setState({
                expandedValue: false,
            });
        } else {
            this.setState({
                expandedValue: true,
            });
        }
    }

    render() {
        const { t, device, theme, timeSeriesExplorerUrl } = this.props,
            { telemetry } = this.state,
            // Add parameters to Time Series Insights Url

            timeSeriesParamUrl = timeSeriesExplorerUrl
                ? timeSeriesExplorerUrl +
                  `&relativeMillis=1800000&timeSeriesDefinitions=[{"name":"${
                      device.id
                  }","measureName":"${
                      Object.keys(telemetry).sort()[0]
                  }","predicate":"'${device.id}'"}]`
                : undefined;

        return (
            <Fragment>
                <TimeIntervalDropdown
                    onChange={this.updateTimeInterval}
                    value={this.props.timeInterval}
                    t={t}
                    className="device-details-time-interval-dropdown"
                />
                {timeSeriesExplorerUrl && (
                    <TimeSeriesInsightsLinkContainer
                        href={timeSeriesParamUrl}
                    />
                )}
                <TelemetryChart
                    className="telemetry-chart"
                    t={t}
                    limitExceeded={this.state.telemetryQueryExceededLimit}
                    telemetry={telemetry}
                    theme={theme}
                    colors={chartColorObjects}
                />
            </Fragment>
        );
    }
}
