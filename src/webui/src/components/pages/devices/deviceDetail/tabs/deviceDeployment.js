// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";
import { IoTHubManagerService } from "services";
import { formatTime } from "utilities";
import {
    PropertyGrid as Grid,
    PropertyGridBody as GridBody,
    PropertyGridHeader as GridHeader,
    PropertyRow as Row,
    PropertyCell as Cell,
    SectionDesc,
    Hyperlink,
    Flyout,
} from "components/shared";

import "./../deviceDetail.scss";
const Section = Flyout.Section;
export class DeviceDeployments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceDeployments: undefined,
        };
        this.baseState = this.state;
    }

    componentDidMount() {
        debugger;
        const { ...deviceId } = this.props;
        this.fetchDeviceDeployments(deviceId);
    }

    fetchDeviceDeployments = (deviceId) => {
        IoTHubManagerService.getDeploymentHistoryForSelectedDevice(
            deviceId
        ).subscribe((deviceDeployments) => {
            debugger;
            var filteredDeployments = [];
            deviceDeployments.forEach((deployment) => {
                if (deployment) {
                    filteredDeployments.push(deployment);
                }
            });
            this.setState({
                deviceDeployments: filteredDeployments,
            });
        });
    };

    render() {
        const { t } = this.props,
            deviceDeployments = this.state.deviceDeployments || [];

        return (
            <div className="device-details-container">
                <div className="device-details-container">
                    <Section.Container>
                        <Section.Header>
                            {t(
                                "devices.flyouts.details.deviceDeployments.title"
                            )}
                        </Section.Header>
                        <Section.Content>
                            <SectionDesc>
                                {t(
                                    "devices.flyouts.details.deviceDeployments.description"
                                )}
                            </SectionDesc>
                            <div className="device-details-deviceDeployments-contentbox">
                                {deviceDeployments.length === 0 &&
                                    t(
                                        "devices.flyouts.details.deviceDeployments.noneExist"
                                    )}
                                {deviceDeployments.length >= 0 && (
                                    <Grid className="device-details-deviceDeployments">
                                        <GridHeader>
                                            <Row>
                                                <Cell className="col-4">
                                                    {t(
                                                        "devices.flyouts.details.deviceDeployments.deploymentName"
                                                    )}
                                                </Cell>
                                                <Cell className="col-4">
                                                    {t(
                                                        "devices.flyouts.details.deviceDeployments.firmwareVersion"
                                                    )}
                                                </Cell>
                                                <Cell className="col-4">
                                                    {t(
                                                        "devices.flyouts.details.deviceDeployments.date"
                                                    )}
                                                </Cell>
                                            </Row>
                                        </GridHeader>
                                        <GridBody>
                                            {deviceDeployments.map(
                                                (deployment, idx) => (
                                                    <Row key={idx}>
                                                        <Cell className="col-4">
                                                            <Hyperlink
                                                                href={`/deployments/${deployment.deploymentId}/false`}
                                                                target="_blank"
                                                            >
                                                                {
                                                                    deployment.deploymentName
                                                                }
                                                            </Hyperlink>
                                                        </Cell>
                                                        <Cell className="col-4">
                                                            {
                                                                deployment.firmwareVersion
                                                            }
                                                        </Cell>
                                                        <Cell className="col-4">
                                                            {formatTime(
                                                                deployment.date
                                                            )}
                                                        </Cell>
                                                    </Row>
                                                )
                                            )}
                                        </GridBody>
                                    </Grid>
                                )}
                            </div>
                        </Section.Content>
                    </Section.Container>
                </div>
            </div>
        );
    }
}
