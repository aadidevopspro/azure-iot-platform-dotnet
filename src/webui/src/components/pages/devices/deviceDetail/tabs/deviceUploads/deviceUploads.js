// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";
import { TelemetryService } from "services";
import { svgs, formatTime } from "utilities";
import {
    Btn,
    PropertyGrid as Grid,
    PropertyGridBody as GridBody,
    PropertyGridHeader as GridHeader,
    PropertyRow as Row,
    PropertyCell as Cell,
} from "components/shared";

import "./../../deviceDetail.module.scss";
export class DeviceUploads extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceUploads: undefined,
            deviceId: props.deviceId,
        };
    }

    componentDidMount() {
        const { deviceId } = this.props;
        this.fetchDeviceUploads(deviceId);
    }

    componentWillUnmount() {
        this.deviceUploadsSubscription.unsubscribe();
    }

    fetchDeviceUploads = (deviceId) => {
        this.deviceUploadsSubscription = TelemetryService.getDeviceUploads(
            deviceId
        ).subscribe((deviceUploads) => {
            this.setState({
                deviceUploads,
            });
        });
    };

    downloadFile = (relativePath, fileName) => {
        TelemetryService.getDeviceUploadsFileContent(relativePath).subscribe(
            (response) => {
                var blob = new Blob([response.response], {
                    type: response.response.contentType,
                });
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
            }
        );
    };

    render() {
        const { t } = this.props,
            deviceUploads = this.state.deviceUploads || [];

        return (
            <div className="device-details-container">
                {deviceUploads.length === 0 &&
                    t("devices.flyouts.details.deviceUploads.noneExist")}
                {deviceUploads.length > 0 && (
                    <Grid className="device-details-deviceuploads">
                        <GridHeader>
                            <Row>
                                <Cell className="col-3">
                                    {t(
                                        "devices.flyouts.details.deviceUploads.fileName"
                                    )}
                                </Cell>
                                <Cell className="col-2">Size</Cell>
                                <Cell className="col-3">Uploaded On</Cell>
                                <Cell className="col-3">Uploaded By</Cell>
                                <Cell className="col-1">
                                    {t(
                                        "devices.flyouts.details.deviceUploads.action"
                                    )}
                                </Cell>
                            </Row>
                        </GridHeader>
                        <GridBody>
                            {deviceUploads.map((upload, idx) => (
                                <Row key={idx}>
                                    <Cell className="col-3">{upload.Name}</Cell>
                                    <Cell className="col-2">
                                        {upload.Size.toString()}
                                    </Cell>
                                    <Cell className="col-3">
                                        {formatTime(upload.UploadedOn)}
                                    </Cell>
                                    <Cell className="col-3">
                                        {upload.UploadedBy}
                                    </Cell>
                                    <Cell className="col-1">
                                        <Btn
                                            svg={svgs.upload}
                                            className="download-deviceupload"
                                            onClick={() =>
                                                this.downloadFile(
                                                    upload.BlobName,
                                                    upload.Name
                                                )
                                            }
                                        ></Btn>
                                    </Cell>
                                </Row>
                            ))}
                        </GridBody>
                    </Grid>
                )}
            </div>
        );
    }
}
