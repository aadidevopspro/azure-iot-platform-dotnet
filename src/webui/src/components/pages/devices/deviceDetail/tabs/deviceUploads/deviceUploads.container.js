// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withNamespaces } from "react-i18next";
import { getTheme } from "store/reducers/appReducer";
import { getDeviceById } from "store/reducers/devicesReducer";
import { DeviceUploads } from ".";

// Pass the device details
const mapStateToProps = (state, props) => ({
    device: getDeviceById(state, props.deviceId),
    theme: getTheme(state),
});

export const DeviceUploadsContainer = withNamespaces()(
    connect(mapStateToProps, null)(DeviceUploads)
);
