// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { DeviceAlerts } from "./deviceAlerts";
import { getDeviceGroups } from "store/reducers/appReducer";
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
    }),
    // Wrap the dispatch method
    mapDispatchToProps = (dispatch) => ({
        fetchRules: () => dispatch(ruleEpics.actions.fetchRules()),
        resetPendingAndError: () =>
            dispatch(
                devicesRedux.actions.resetPendingAndError(
                    devicesEpics.actions.fetchEdgeAgent
                )
            ),
    });

export const DeviceAlertsContainer = withTranslation()(
    connect(mapStateToProps, mapDispatchToProps)(DeviceAlerts)
);
