// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";
import update from "immutability-helper";

import Config from "app.config";
import { AjaxError, Indicator } from "components/shared";
import {
    Panel,
    PanelHeader,
    PanelHeaderLabel,
    PanelContent,
    PanelOverlay,
    PanelError,
} from "components/pages/dashboard/panel";
import { DeviceDetailsContainer } from "components/pages/devices/flyouts/deviceDetails";
import { toDiagnosticsModel } from "services/models";
import { AzureMap } from "./azureMap";

const classnames = require("classnames/bind");
const css = classnames.bind(require("./mapPanel.module.scss"));

const AzureMaps = window.atlas,
    nominalDeviceLayer = "devices-nominal-layer",
    warningDevicesLayer = "devices-warning-layer",
    criticalDevicesLayer = "devices-critical-layer",
    deviceToMapPin = ({ id, properties, type }) =>
        new AzureMaps.data.Feature(
            new AzureMaps.data.Point([
                properties.Longitude,
                properties.Latitude,
            ]),
            {
                id,
                address: properties.location || "",
                type,
            }
        );

export class MapPanel extends Component {
    constructor(props) {
        super(props);

        this.state = { selectedDeviceId: undefined };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.calculatePins(nextProps);
    }

    onMapReady = (map) => {
        // Create the map popup
        this.popup = new AzureMaps.Popup();

        // Create the device pin layers and bind click events
        [
            [nominalDeviceLayer, "nominal", "pin-blue"],
            [warningDevicesLayer, "warning", "pin-darkblue"],
            [criticalDevicesLayer, "alert", "pin-red"],
        ].forEach(([name, classname, icon]) => {
            map.addPins([], { name, icon, cluster: true });
            map.addEventListener("click", name, (event) => {
                const [pin] = event.features;
                this.popup.setPopupOptions({
                    position: pin.geometry.coordinates,
                    content: this.buildDevicePopup(
                        pin.properties,
                        css(classname)
                    ),
                });
                this.props.logEvent(toDiagnosticsModel("Map_DeviceClick", {}));
                this.popup.open(map);
            });
        });

        // Save this.map here to prevent calculatePins
        // from being called before the pins are added
        this.map = map;
        this.calculatePins(this.props, true);
    };

    buildDevicePopup = (properties, classname) => {
        const popupContentBox = document.createElement("div");
        popupContentBox.classList.add(css("popup-content-box"));
        popupContentBox.classList.add(css(classname));

        const type = document.createElement("div");
        type.classList.add(css("popup-type"));
        type.innerText = properties.cluster
            ? "Device Cluster"
            : properties.type;

        const name = document.createElement("div");
        name.classList.add(css("popup-device-name"));
        name.innerText = properties.cluster
            ? `Devices: ${properties.point_count}`
            : properties.id;

        popupContentBox.appendChild(type);
        popupContentBox.appendChild(name);

        popupContentBox.onclick = () => {
            // Check this to void any potential attempts to reference the component after unmount
            if (this) {
                this.openDeviceDetails(properties.id);
            }
        };

        return popupContentBox;
    };

    calculatePins(props, mounting = false) {
        if (this.map) {
            const deviceIds = Object.keys(props.devices),
                prevDeviceIds = Object.keys(this.props.devices),
                /*
      Zoom to the bounding box of devices only, when
        1) When devices become available for the first time
        2) When the component is mounting and the devices
      */
                boundZoomToDevices =
                    (deviceIds.length > 0 && prevDeviceIds.length === 0) ||
                    (mounting && deviceIds.length > 0);

            if (
                props.analyticsVersion !== this.props.analyticsVersion ||
                boundZoomToDevices
            ) {
                const geoLocatedDevices = this.extractGeoLocatedDevices(
                    props.devices || []
                );
                if (
                    Object.keys(geoLocatedDevices).length > 0 &&
                    props.devicesInAlert
                ) {
                    const { normal, warning, critical } = this.devicesToPins(
                        geoLocatedDevices,
                        props.devicesInAlert
                    );

                    this.map.addPins(normal, {
                        name: nominalDeviceLayer,
                        overwrite: true,
                    });
                    this.map.addPins(warning, {
                        name: warningDevicesLayer,
                        overwrite: true,
                    });
                    this.map.addPins(critical, {
                        name: criticalDevicesLayer,
                        overwrite: true,
                    });

                    if (boundZoomToDevices) {
                        this.zoomToPins(
                            [].concat.apply([], [normal, warning, critical])
                        );
                    }
                }
            }
        }
    }

    extractGeoLocatedDevices(devices) {
        return Object.keys(devices)
            .map((key) => devices[key])
            .filter(
                ({ properties }) => properties.Latitude && properties.Longitude
            );
    }

    devicesToPins(devices, devicesInAlert) {
        return devices.reduce(
            (acc, device) => {
                const devicePin = deviceToMapPin(device);
                if (devicePin.properties.type === undefined) {
                    devicePin.properties.type = "Unknown Device";
                }
                const category =
                    device.id in devicesInAlert
                        ? devicesInAlert[device.id].severity
                        : "normal";
                if (
                    category === "normal" ||
                    category === Config.ruleSeverity.warning ||
                    category === Config.ruleSeverity.critical
                ) {
                    return update(acc, {
                        [category]: { $push: [devicePin] },
                    });
                }
                return acc;
            },
            { normal: [], warning: [], critical: [] }
        );
    }

    zoomToPins(pins) {
        const lons = [],
            lats = [];
        pins.forEach(
            ({
                geometry: {
                    coordinates: [longitude, latitude],
                },
            }) => {
                lons.push(longitude);
                lats.push(latitude);
            }
        );

        const swLon = Math.min.apply(null, lons),
            swLat = Math.min.apply(null, lats),
            neLon = Math.max.apply(null, lons),
            neLat = Math.max.apply(null, lats);

        // Zoom the map to the bounding box of the devices
        this.map.setCameraBounds({
            bounds: [swLon, swLat, neLon, neLat],
            padding: 50,
        });
    }

    zoom = (zoomFactor) => {
        if (this.map) {
            const currZoom = this.map.getCamera().zoom;
            this.map.setCamera({ zoom: currZoom + zoomFactor });
        }
    };

    zoomIn = () => this.zoom(1);

    zoomOut = () => this.zoom(-1);

    openDeviceDetails = (selectedDeviceId) =>
        this.setState({ selectedDeviceId });

    closeDeviceDetails = () => this.setState({ selectedDeviceId: undefined });

    render() {
        const { t, isPending, mapKeyIsPending, azureMapsKey, error } =
                this.props,
            showOverlay = !error && isPending && mapKeyIsPending;
        return (
            <Panel className={css("map-panel-container")}>
                <PanelHeader>
                    <PanelHeaderLabel>
                        {t("dashboard.panels.map.header")}
                    </PanelHeaderLabel>
                </PanelHeader>
                <PanelContent className={css("map-panel-container")}>
                    <AzureMap
                        azureMapsKey={azureMapsKey}
                        onMapReady={this.onMapReady}
                    />
                    <button
                        className={css("zoom-btn", "zoom-in")}
                        onClick={this.zoomIn}
                    >
                        +
                    </button>
                    <button
                        className={css("zoom-btn", "zoom-out")}
                        onClick={this.zoomOut}
                    >
                        -
                    </button>
                </PanelContent>
                {showOverlay && (
                    <PanelOverlay>
                        <Indicator />
                    </PanelOverlay>
                )}
                {!mapKeyIsPending && !this.props.azureMapsKey && (
                    <PanelError>
                        {t("dashboard.panels.map.notSupportedError")}
                    </PanelError>
                )}
                {error && (
                    <PanelError>
                        <AjaxError t={t} error={error} />
                    </PanelError>
                )}
                {this.state.selectedDeviceId && (
                    <DeviceDetailsContainer
                        onClose={this.closeDeviceDetails}
                        deviceId={this.state.selectedDeviceId}
                    />
                )}
            </Panel>
        );
    }
}
