// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { getTheme } from "store/reducers/appReducer";
import { DeviceUploads } from ".";

// Pass the device details
const mapStateToProps = (state, props) => ({
    theme: getTheme(state),
});

export const DeviceUploadsContainer = withTranslation()(
    connect(mapStateToProps, null)(DeviceUploads)
);
