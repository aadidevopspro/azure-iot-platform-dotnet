// Copyright (c) Microsoft. All rights reserved.

import React, { Component, Fragment } from "react";
import { merge, of, Subject } from "rxjs";
import { delay, map, mergeMap, switchMap, tap } from "rxjs/operators";
import Config from "app.config";
import { TelemetryService } from "services";
import { int, DEFAULT_TIME_FORMAT } from "utilities";
import { TimeSeriesInsightsLinkContainer } from "components/shared";
import { TimeIntervalDropdownContainer as TimeIntervalDropdown } from "components/shell/timeIntervalDropdown";
import {
    TelemetryChartContainer as TelemetryChart,
    chartColorObjects,
} from "components/pages/dashboard/panels/telemetry";
import moment from "moment";
import {
    Btn,
    ComponentArray,
    PropertyGrid as Grid,
    PropertyGridBody as GridBody,
    PropertyGridHeader as GridHeader,
    PropertyRow as Row,
    PropertyCell as Cell,
    SectionDesc,
} from "components/shared";
import { transformTelemetryResponse } from "components/pages/dashboard/panels";
import { Pivot, PivotItem } from "@fluentui/react";
import Flyout from "components/shared/flyout";
const classnames = require("classnames/bind");
const css = classnames.bind(require("../../deviceDetail.module.scss"));

const Section = Flyout.Section;

export class Telemetry extends Component {
    constructor(props) {
        super(props);

        this.state = {
            telemetry: {},
            telemetryIsPending: true,
            telemetryError: null,
            telemetryQueryExceededLimit: false,
            showRawMessage: false,
        };
        this.baseState = this.state;
        this.resetTelemetry$ = new Subject();
        this.telemetryRefresh$ = new Subject();
    }

    componentDidMount() {
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

    handleLinkClick = (item) => {
        if (
            item &&
            item.props &&
            item.props.itemKey &&
            item.props.itemKey === "Telemetry"
        ) {
            console.log(item.props.itemKey);
            this.resetTelemetry$.next(this.props.device.id);
        }
    };

    render() {
        const { t, device, theme, timeSeriesExplorerUrl } = this.props,
            { telemetry, lastMessage } = this.state,
            lastMessageTime = (lastMessage || {}).time,
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
                <Pivot
                    aria-label="Device Tags"
                    linkSize="large"
                    onLinkClick={this.handleLinkClick}
                >
                    <PivotItem
                        headerText="Telemetry"
                        itemKey="Telemetry"
                        key="Telemetry"
                    >
                        <div className={css("padding-20")}>
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
                                limitExceeded={
                                    this.state.telemetryQueryExceededLimit
                                }
                                telemetry={telemetry}
                                theme={theme}
                                colors={chartColorObjects}
                            />
                        </div>
                    </PivotItem>
                    <PivotItem
                        headerText="Diagnostics"
                        itemKey="Diagnostics"
                        key="Diagnostics"
                    >
                        <div className={css("padding-20")}>
                            <Section.Container>
                                <Section.Content>
                                    <SectionDesc>
                                        {t(
                                            "devices.flyouts.details.diagnostics.description"
                                        )}
                                    </SectionDesc>
                                    <Grid
                                        className={css(
                                            "device-details-diagnostics"
                                        )}
                                    >
                                        <GridHeader>
                                            <Row>
                                                <Cell className="col-3">
                                                    {t(
                                                        "devices.flyouts.details.diagnostics.keyHeader"
                                                    )}
                                                </Cell>
                                                <Cell className="col-15">
                                                    {t(
                                                        "devices.flyouts.details.diagnostics.valueHeader"
                                                    )}
                                                </Cell>
                                            </Row>
                                        </GridHeader>
                                        <GridBody>
                                            <Row>
                                                <Cell className="col-3">
                                                    {t(
                                                        "devices.flyouts.details.diagnostics.status"
                                                    )}
                                                </Cell>
                                                <Cell className="col-15">
                                                    {device.connected
                                                        ? t(
                                                              "devices.flyouts.details.connected"
                                                          )
                                                        : t(
                                                              "devices.flyouts.details.notConnected"
                                                          )}
                                                </Cell>
                                            </Row>
                                            {!device.connected && (
                                                <ComponentArray>
                                                    <Row>
                                                        <Cell className="col-3">
                                                            {t(
                                                                "devices.flyouts.details.diagnostics.lastMessage"
                                                            )}
                                                        </Cell>
                                                        <Cell className="col-15">
                                                            {lastMessageTime
                                                                ? moment(
                                                                      lastMessageTime
                                                                  ).format(
                                                                      DEFAULT_TIME_FORMAT
                                                                  )
                                                                : "---"}
                                                        </Cell>
                                                    </Row>
                                                    <Row>
                                                        <Cell className="col-3">
                                                            {t(
                                                                "devices.flyouts.details.diagnostics.message"
                                                            )}
                                                        </Cell>
                                                        <Cell className="col-3">
                                                            <Btn
                                                                className={css(
                                                                    "raw-message-button"
                                                                )}
                                                                onClick={
                                                                    this
                                                                        .toggleRawDiagnosticsMessage
                                                                }
                                                            >
                                                                {t(
                                                                    "devices.flyouts.details.diagnostics.showMessage"
                                                                )}
                                                            </Btn>
                                                        </Cell>
                                                    </Row>
                                                </ComponentArray>
                                            )}
                                            {this.state.showRawMessage && (
                                                <Row>
                                                    <pre>
                                                        {JSON.stringify(
                                                            lastMessage,
                                                            null,
                                                            2
                                                        )}
                                                    </pre>
                                                </Row>
                                            )}
                                        </GridBody>
                                    </Grid>
                                </Section.Content>
                            </Section.Container>
                        </div>
                    </PivotItem>
                </Pivot>
            </Fragment>
        );
    }
}
