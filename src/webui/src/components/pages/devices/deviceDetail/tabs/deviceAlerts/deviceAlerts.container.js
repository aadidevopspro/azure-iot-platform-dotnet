// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withNamespaces } from "react-i18next";
import { DeviceAlerts } from "./deviceAlerts";
import {
    redux as appRedux,
    getTheme,
    getDeviceGroups,
} from "store/reducers/appReducer";
import {
    epics as ruleEpics,
    getEntities as getRulesEntities,
    getRulesLastUpdated,
    getRulesPendingStatus,
} from "store/reducers/rulesReducer";
import {
    getDeviceById,
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
    });

export const DeviceAlertsContainer = withNamespaces()(
    connect(mapStateToProps, mapDispatchToProps)(DeviceAlerts)
);
