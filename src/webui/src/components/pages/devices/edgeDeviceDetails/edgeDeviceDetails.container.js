// Copyright (c) Microsoft. All rights reserved.

import { connect } from "react-redux";
import { epics as appEpics } from "store/reducers/appReducer";
import {
    getGrafanaOrgId,
    getEdgeGrafanaUrl,
    getUser,
} from "store/reducers/appReducer";
import { EdgeDeviceDetails } from "./edgeDeviceDetails";
import { withTranslation } from "react-i18next";

const mapStateToProps = (state) => ({
        edgeGrafanaUrl: getEdgeGrafanaUrl(state),
        grafanaOrgId: getGrafanaOrgId(state),
        user: getUser(state),
    }),
    mapDispatchToProps = (dispatch) => ({
        logEvent: (diagnosticsModel) =>
            dispatch(appEpics.actions.logEvent(diagnosticsModel)),
    });

export const EdgeDeviceDetailsContainer = withTranslation()(
    connect(mapStateToProps, mapDispatchToProps)(EdgeDeviceDetails)
);
