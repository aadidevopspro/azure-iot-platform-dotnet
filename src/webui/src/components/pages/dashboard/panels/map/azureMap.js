// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from "react";

import Config from "app.config";
import { isFunc } from "utilities";

const AzureMaps = window.atlas;

// Check the hooks
export class AzureMap extends Component {
    componentDidMount() {
        if (!this.map && this.props.azureMapsKey) {
            this.initializeMap(this.props.azureMapsKey);
        }
    }

    // UNSAFE_componentWillReceiveProps(nextProps) {
    //     if (!this.map && nextProps.azureMapsKey) {
    //         this.initializeMap(nextProps.azureMapsKey);
    //     }
    // }

    componentDidUpdate(prevProps, prevState) {
        if (!this.map && this.props.azureMapsKey) {
            this.initializeMap(this.props.azureMapsKey);
        }
    }

    componentWillUnmount() {
        // Clean up the azure map resources on unmount
        if (this.map) {
            this.map.remove();
        }
    }

    // shouldComponentUpdate(nextProps) {
    //     // Component props never result in a dom updates from React
    //     return false;
    // }

    initializeMap(azureMapsKey) {
        this.map = new AzureMaps.Map("map", {
            "subscription-key": azureMapsKey,
            center: Config.mapCenterPosition,
            zoom: 11,
            enableAccessibility: true,
        });

        this.map.addEventListener("load", () => {
            if (isFunc(this.props.onMapReady)) {
                this.props.onMapReady(this.map);
            }
        });
    }

    render() {
        return <div id="map"></div>;
    }
}
