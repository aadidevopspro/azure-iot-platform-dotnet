// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { getDeviceById } from "store/reducers/devicesReducer";
import { DeviceTags } from "./deviceTags";

// Pass the device details
const mapStateToProps = (state, props) => ({
    device: getDeviceById(state, props.deviceId),
});

export const DeviceTagsContainer = withTranslation()(
    connect(mapStateToProps, null)(DeviceTags)
);
