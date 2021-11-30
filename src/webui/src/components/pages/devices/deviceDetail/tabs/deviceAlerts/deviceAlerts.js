// Copyright (c) Microsoft. All rights reserved.

import React, { Component, Fragment } from "react";
import { rulesColumnDefs, RulesGrid } from "components/pages/rules/rulesGrid";
import { TelemetryService } from "services";
import { translateColumnDefs } from "utilities";

export class DeviceAlerts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: undefined,
            isAlertsPending: false,
            alertsError: undefined,
            deviceId: props.deviceId,
        };
        this.baseState = this.state;
        this.columnDefs = [
            {
                ...rulesColumnDefs.ruleName,
                cellRendererFramework: undefined, // Don't allow soft select from an open flyout
            },
            rulesColumnDefs.severity,
            rulesColumnDefs.alertStatus,
            rulesColumnDefs.explore,
        ];
    }

    componentDidMount() {
        if (!this.props.rulesLastUpdated) {
            this.props.fetchRules();
        }
        const deviceId = this.state.deviceId;
        this.fetchAlerts(deviceId);
    }

    componentWillReceiveProps(nextProps) {
        const { resetPendingAndError, device } = nextProps;
        let tempState = {};

        if ((this.props.device || {}).id !== device.id) {
            // Reset state if the device changes.
            resetPendingAndError();
            tempState = { ...this.baseState };

            const deviceId = (device || {}).id;
            this.fetchAlerts(deviceId);
        }

        if (Object.keys(tempState).length) {
            this.setState(tempState);
        }
    }

    componentWillUnmount() {
        this.alertSubscription.unsubscribe();
    }

    applyRuleNames = (alerts, rules) =>
        alerts.map((alert) => ({
            ...alert,
            name: (rules[alert.ruleId] || {}).name,
        }));

    fetchAlerts = (deviceId) => {
        this.setState({ isAlertsPending: true });

        this.alertSubscription = TelemetryService.getAlerts({
            limit: 5,
            order: "desc",
            devices: deviceId,
        }).subscribe(
            (alerts) =>
                this.setState({
                    alerts,
                    isAlertsPending: false,
                    alertsError: undefined,
                }),
            (alertsError) =>
                this.setState({ alertsError, isAlertsPending: false })
        );
    };

    render() {
        const isPending = this.state.isAlertsPending && this.props.isRulesPending,
        rulesGridProps = {
            rowData: isPending
                ? undefined
                : this.applyRuleNames(
                      this.state.alerts || [],
                      this.props.rules || []
                  ),
            t: this.props.t,
            deviceGroups: this.props.deviceGroups,
            domLayout: "autoHeight",
            columnDefs: translateColumnDefs(this.props.t, this.columnDefs),
            suppressFlyouts: true,
        };

        return (<Fragment>{!this.state.isAlertsPending &&
            this.state.alerts &&
            this.state.alerts.length > 0 && (
                <RulesGrid {...rulesGridProps} />
            )}</Fragment>);
    }
}
