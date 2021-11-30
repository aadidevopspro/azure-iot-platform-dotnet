// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withNamespaces } from "react-i18next";
import { redux as appRedux, getTimeInterval } from "store/reducers/appReducer";
import { epics as ruleEpics } from "store/reducers/rulesReducer";
import {
    getDeviceById,
    epics as devicesEpics,
    redux as devicesRedux,
} from "store/reducers/devicesReducer";
import { DeviceTags } from "./deviceTags";

// Pass the device details
const mapStateToProps = (state, props) => ({
        device: getDeviceById(state, props.deviceId),
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
    });

export const DeviceTagsContainer = withNamespaces()(
    connect(mapStateToProps, mapDispatchToProps)(DeviceTags)
);
