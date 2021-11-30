// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";
import { Trans } from "react-i18next";
import {
    Balloon,
    BalloonPosition,
} from "@microsoft/azure-iot-ux-fluent-controls/lib/components/Balloon/Balloon";

import { copyToClipboard, svgs } from "utilities";
import {
    Btn,
    ComponentArray,
    ErrorMsg,
    PropertyGrid as Grid,
    PropertyGridBody as GridBody,
    PropertyGridHeader as GridHeader,
    PropertyRow as Row,
    PropertyCell as Cell,
    SectionDesc,
} from "components/shared";
import Flyout from "components/shared/flyout";
import {
    Label,
    Pivot,
    PivotItem,
} from "@microsoft/azure-iot-ux-fluent-controls/lib/components/Pivot";

const Section = Flyout.Section,
    serializeNestedDeviceProperties = (parentName, value) => {
        if (typeof value !== "object" || value === null) {
            let prop = {};
            prop[parentName] = value;
            return prop;
        }

        let nestedProperties = {};
        Object.entries(value).forEach(([key, value]) => {
            nestedProperties = {
                ...nestedProperties,
                ...serializeNestedDeviceProperties(
                    `${parentName}.${key}`,
                    value
                ),
            };
        });
        return nestedProperties;
    };

export class DeviceTags extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showRawMessage: false,
            expandedValue: false,
        };
        this.baseState = this.state;
    }

    copyDevicePropertiesToClipboard = () => {
        if (this.props.device) {
            copyToClipboard(JSON.stringify(this.props.device.properties || {}));
        }
    };

    toggleRawDiagnosticsMessage = () => {
        this.setState({ showRawMessage: !this.state.showRawMessage });
    };

    updateTimeInterval = (timeInterval) => {
        this.props.updateTimeInterval(timeInterval);
        this.resetTelemetry$.next(this.props.device.id);
    };

    expandFlyout() {
        if (this.state.expandedValue) {
            this.setState({
                expandedValue: false,
            });
        } else {
            this.setState({
                expandedValue: true,
            });
        }
    }

    render() {
        const { t, device } = this.props,
            tags = Object.entries(device.tags || {}),
            properties = Object.entries(device.properties || {});

        return (
            <div className="device-details-container">
                {!device && (
                    <div className="device-details-container">
                        <ErrorMsg>
                            {t("devices.flyouts.details.noDevice")}
                        </ErrorMsg>
                    </div>
                )}
                {!!device && (
                    <div className="device-details-container">
                        <Pivot
                            aria-label="Remove Pivot Example"
                            linkSize="large"
                            linkFormat="tabs"
                        >
                            <PivotItem headerText="Foo" itemKey="Foo" key="Foo">
                                <Label>
                                    Click the button below to show/hide this
                                    pivot item.
                                </Label>
                                <Label>
                                    The selected item will not change when the
                                    number of pivot items changes.
                                </Label>
                                <Label>
                                    If the selected item was removed, the new
                                    first item will be selected.
                                </Label>
                            </PivotItem>
                            <PivotItem headerText="Bar" itemKey="Bar" key="Bar">
                                <Label>Pivot #2</Label>
                            </PivotItem>
                            <PivotItem headerText="Bas" itemKey="Bas" key="Bas">
                                <Label>Pivot #3</Label>
                            </PivotItem>
                            <PivotItem headerText="Biz" itemKey="Biz" key="Biz">
                                <Label>Pivot #4</Label>
                            </PivotItem>
                        </Pivot>
                        <Section.Container>
                            <Section.Header>
                                {t("devices.flyouts.details.tags.title")}
                            </Section.Header>
                            <Section.Content>
                                <SectionDesc>
                                    <Trans
                                        i18nKey={
                                            "devices.flyouts.details.tags.description"
                                        }
                                    >
                                        To edit, close this panel, click on
                                        <strong>
                                            {{
                                                jobs: t(
                                                    "devices.flyouts.jobs.title"
                                                ),
                                            }}
                                        </strong>
                                        then select
                                        <strong>
                                            {{
                                                tags: t(
                                                    "devices.flyouts.jobs.tags.radioLabel"
                                                ),
                                            }}
                                        </strong>
                                        .
                                    </Trans>
                                </SectionDesc>
                                {tags.length === 0 &&
                                    t("devices.flyouts.details.tags.noneExist")}
                                {tags.length > 0 && (
                                    <Grid>
                                        <GridHeader>
                                            <Row>
                                                <Cell className="col-3">
                                                    {t(
                                                        "devices.flyouts.details.tags.keyHeader"
                                                    )}
                                                </Cell>
                                                <Cell className="col-7">
                                                    {t(
                                                        "devices.flyouts.details.tags.valueHeader"
                                                    )}
                                                </Cell>
                                            </Row>
                                        </GridHeader>
                                        <GridBody>
                                            {tags.map(
                                                ([tagName, tagValue], idx) => (
                                                    <Row key={idx}>
                                                        <Cell className="col-3">
                                                            {tagName}
                                                        </Cell>
                                                        <Cell className="col-7">
                                                            {tagValue.toString()}
                                                        </Cell>
                                                    </Row>
                                                )
                                            )}
                                        </GridBody>
                                    </Grid>
                                )}
                            </Section.Content>
                        </Section.Container>

                        <Section.Container>
                            <Section.Header>
                                {t("devices.flyouts.details.methods.title")}
                            </Section.Header>
                            <Section.Content>
                                <SectionDesc>
                                    <Trans
                                        i18nKey={
                                            "devices.flyouts.details.methods.description"
                                        }
                                    >
                                        To edit, close this panel, click on
                                        <strong>
                                            {{
                                                jobs: t(
                                                    "devices.flyouts.jobs.title"
                                                ),
                                            }}
                                        </strong>
                                        then select
                                        <strong>
                                            {{
                                                methods: t(
                                                    "devices.flyouts.jobs.methods.radioLabel"
                                                ),
                                            }}
                                        </strong>
                                        .
                                    </Trans>
                                </SectionDesc>
                                {device.methods.length === 0 ? (
                                    t(
                                        "devices.flyouts.details.methods.noneExist"
                                    )
                                ) : (
                                    <Grid>
                                        {device.methods.map(
                                            (methodName, idx) => (
                                                <Row key={idx}>
                                                    <Cell>{methodName}</Cell>
                                                </Row>
                                            )
                                        )}
                                    </Grid>
                                )}
                            </Section.Content>
                        </Section.Container>

                        <Section.Container>
                            <Section.Header>
                                {t("devices.flyouts.details.properties.title")}
                            </Section.Header>
                            <Section.Content>
                                <SectionDesc>
                                    <Trans
                                        i18nKey={
                                            "devices.flyouts.details.properties.description"
                                        }
                                    >
                                        To edit, close this panel, click on
                                        <strong>
                                            {{
                                                jobs: t(
                                                    "devices.flyouts.jobs.title"
                                                ),
                                            }}
                                        </strong>
                                        then select
                                        <strong>
                                            {{
                                                properties: t(
                                                    "devices.flyouts.jobs.properties.radioLabel"
                                                ),
                                            }}
                                        </strong>
                                        .
                                    </Trans>
                                </SectionDesc>
                                {properties.length === 0 &&
                                    t(
                                        "devices.flyouts.details.properties.noneExist"
                                    )}
                                {properties.length > 0 && (
                                    <ComponentArray>
                                        <Grid>
                                            <GridHeader>
                                                <Row>
                                                    <Cell className="col-3">
                                                        {t(
                                                            "devices.flyouts.details.properties.keyHeader"
                                                        )}
                                                    </Cell>
                                                    <Cell className="col-15">
                                                        {t(
                                                            "devices.flyouts.details.properties.valueHeader"
                                                        )}
                                                    </Cell>
                                                </Row>
                                            </GridHeader>
                                            <GridBody>
                                                {properties.map(
                                                    (
                                                        [
                                                            propertyName,
                                                            propertyValue,
                                                        ],
                                                        idx
                                                    ) => {
                                                        const desiredPropertyValue =
                                                                device
                                                                    .desiredProperties[
                                                                    propertyName
                                                                ],
                                                            serializedProperties = serializeNestedDeviceProperties(
                                                                propertyName,
                                                                propertyValue
                                                            ),
                                                            rows = [];
                                                        Object.entries(
                                                            serializedProperties
                                                        ).forEach(
                                                            ([
                                                                propertyDisplayName,
                                                                value,
                                                            ]) => {
                                                                const displayValue =
                                                                        !desiredPropertyValue ||
                                                                        value ===
                                                                            desiredPropertyValue
                                                                            ? value.toString()
                                                                            : t(
                                                                                  "devices.flyouts.details.properties.syncing",
                                                                                  {
                                                                                      reportedPropertyValue: value.toString(),
                                                                                      desiredPropertyValue: desiredPropertyValue.toString(),
                                                                                  }
                                                                              ),
                                                                    truncatedDisplayName =
                                                                        propertyDisplayName.length <=
                                                                        20
                                                                            ? propertyDisplayName
                                                                            : `...${propertyDisplayName.substring(
                                                                                  propertyDisplayName.length -
                                                                                      17
                                                                              )}`;
                                                                rows.push(
                                                                    <Row
                                                                        key={
                                                                            idx
                                                                        }
                                                                    >
                                                                        <Cell className="col-3">
                                                                            <Balloon
                                                                                position={
                                                                                    BalloonPosition.Left
                                                                                }
                                                                                tooltip={
                                                                                    <Trans>
                                                                                        {
                                                                                            propertyDisplayName
                                                                                        }
                                                                                    </Trans>
                                                                                }
                                                                            >
                                                                                {
                                                                                    truncatedDisplayName
                                                                                }
                                                                            </Balloon>
                                                                        </Cell>
                                                                        <Cell className="col-15">
                                                                            {
                                                                                displayValue
                                                                            }
                                                                        </Cell>
                                                                    </Row>
                                                                );
                                                            }
                                                        );
                                                        return rows;
                                                    }
                                                )}
                                            </GridBody>
                                        </Grid>
                                        <Grid className="device-properties-actions">
                                            <Row>
                                                <Cell className="col-8">
                                                    {t(
                                                        "devices.flyouts.details.properties.copyAllProperties"
                                                    )}
                                                </Cell>
                                                <Cell className="col-2">
                                                    <Btn
                                                        svg={svgs.copy}
                                                        onClick={
                                                            this
                                                                .copyDevicePropertiesToClipboard
                                                        }
                                                    >
                                                        {t(
                                                            "devices.flyouts.details.properties.copy"
                                                        )}
                                                    </Btn>
                                                </Cell>
                                            </Row>
                                        </Grid>
                                    </ComponentArray>
                                )}
                            </Section.Content>
                        </Section.Container>
                    </div>
                )}
            </div>
        );
    }
}
