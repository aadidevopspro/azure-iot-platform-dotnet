// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { DeviceDeployments } from "./deviceDeployment";
import { getTheme } from "store/reducers/appReducer";

// Pass the device details
const mapStateToProps = (state, props) => ({
    theme: getTheme(state),
});

export const DeviceDeploymentsContainer = withTranslation()(
    connect(mapStateToProps, null)(DeviceDeployments)
);
