// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withNamespaces } from "react-i18next";
import { DeviceDetail } from "./deviceDetail";
import {
    redux as appRedux,
    epics as appEpics,
    getTheme,
    getDeviceGroups,
    getTimeSeriesExplorerUrl,
    getTimeInterval,
} from "store/reducers/appReducer";
import {
    epics as ruleEpics,
    getEntities as getRulesEntities,
    getRulesLastUpdated,
    getRulesPendingStatus,
} from "store/reducers/rulesReducer";
import {
    getDeviceById,
    getDeviceModuleStatus,
    getDeviceModuleStatusPendingStatus,
    getDeviceModuleStatusError,
    epics as devicesEpics,
    redux as devicesRedux,
} from "store/reducers/devicesReducer";

// Pass the device details
const mapStateToProps = (state, props) => ({
        device: getDeviceById(state, props.deviceId),
        isRulesPending: getRulesPendingStatus(state),
        rules: getRulesEntities(state),
        rulesLastUpdated: getRulesLastUpdated(state),
        deviceGroups: getDeviceGroups(state),
        theme: getTheme(state),
        timeSeriesExplorerUrl: getTimeSeriesExplorerUrl(state),
        deviceModuleStatus: getDeviceModuleStatus(state),
        isDeviceModuleStatusPending: getDeviceModuleStatusPendingStatus(state),
        deviceModuleStatusError: getDeviceModuleStatusError(state),
        timeInterval: getTimeInterval(state),
    }),
    // Wrap the dispatch method
    mapDispatchToProps = (dispatch) => ({
        fetchRules: () => dispatch(ruleEpics.actions.fetchRules()),
        fetchModules: (deviceId) =>
            dispatch(devicesEpics.actions.fetchEdgeAgent(deviceId)),
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

export const DeviceDetailContainer = withNamespaces()(
    connect(mapStateToProps, mapDispatchToProps)(DeviceDetail)
);
