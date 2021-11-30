// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { DeviceDeployments } from "./deviceDeployment";
import { getTheme } from "store/reducers/appReducer";
import { getDeviceById } from "store/reducers/devicesReducer";

// Pass the device details
const mapStateToProps = (state, props) => ({
    device: getDeviceById(state, props.deviceId),
    theme: getTheme(state),
});

export const DeviceDeploymentsContainer = withTranslation()(
    connect(mapStateToProps, null)(DeviceDeployments)
);
