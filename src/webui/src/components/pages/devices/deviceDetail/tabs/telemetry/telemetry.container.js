// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import {
    redux as appRedux,
    epics as appEpics,
    getTheme,
    getTimeSeriesExplorerUrl,
    getTimeInterval,
} from "store/reducers/appReducer";
import {
    getDeviceById,
    epics as devicesEpics,
    redux as devicesRedux,
} from "store/reducers/devicesReducer";
import { Telemetry } from "./telemetry";

// Pass the device details
const mapStateToProps = (state, props) => ({
        device: getDeviceById(state, props.deviceId),
        theme: getTheme(state),
        timeSeriesExplorerUrl: getTimeSeriesExplorerUrl(state),
        timeInterval: getTimeInterval(state),
    }),
    // Wrap the dispatch method
    mapDispatchToProps = (dispatch) => ({
        resetPendingAndError: () =>
            dispatch(
                devicesRedux.actions.resetPendingAndError(
                    devicesEpics.actions.fetchEdgeAgent
                )
            ),
        updateTimeInterval: (timeInterval) =>
            dispatch(appRedux.actions.updateTimeInterval(timeInterval)),
        logEvent: (diagnosticsModel) =>
            dispatch(appEpics.actions.logEvent(diagnosticsModel)),
    });

export const TelemetryContainer = withTranslation()(
    connect(mapStateToProps, mapDispatchToProps)(Telemetry)
);
