// Copyright (c) Microsoft. All rights reserved.

// eslint-disable-next-line no-unused-vars
import Config from "app.config";
import { HttpClient } from "utilities/httpClient";
import {
    prepareLogoResponse,
    toDeviceGroupModel,
    toDeviceGroupsModel,
    toSolutionSettingActionsModel,
    toSolutionSettingThemeModel,
    toSolutionSettingFirmwareModel,
    toNewPackageRequestModel,
    toPackagesModel,
    toPackageModel,
    toConfigTypesModel,
    toNewFirmwareUploadRequestModel,
    toFirmwareModel,
    backupDefaultFirmwareModel,
    toColumnMappings,
    toColumnMapping,
    toColumnOptions,
    toColumnOption,
} from "./models";
import { throwError, EMPTY, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

const ENDPOINT = Config.serviceUrls.config;
export const INACTIVE_PACKAGE_TAG = "reserved.inactive";

/** Contains methods for calling the config service */
export class ConfigService {
    /** Returns a the account's device groups */
    static getDeviceGroups() {
        return HttpClient.get(`${ENDPOINT}devicegroups`).pipe(
            map(toDeviceGroupsModel)
        );
    }

    /** Creates a new device group */
    static createDeviceGroup(payload) {
        return HttpClient.post(`${ENDPOINT}devicegroups`, payload).pipe(
            map(toDeviceGroupModel)
        );
    }

    static updateDeviceGroup(id, payload) {
        return HttpClient.put(`${ENDPOINT}devicegroups/${id}`, payload).pipe(
            map(toDeviceGroupModel)
        );
    }

    /** Delete a device group */
    static deleteDeviceGroup(id) {
        return HttpClient.delete(`${ENDPOINT}devicegroups/${id}`).pipe(
            map((_) => id)
        );
    }

    static getLogo() {
        let options = {};
        options.responseType = "blob";
        options.headers = {
            Accept: undefined,
            "Content-Type": undefined,
        };
        return HttpClient.get(
            `${ENDPOINT}solution-settings/logo`,
            options
        ).pipe(map(prepareLogoResponse));
    }

    static setLogo(logo, header) {
        const options = {
            headers: header,
            responseType: "blob",
        };

        if (!logo) {
            logo = "";
        }

        options.headers.Accept = undefined;
        return HttpClient.put(
            `${ENDPOINT}solution-settings/logo`,
            logo,
            options
        ).pipe(map(prepareLogoResponse));
    }

    /* Get solution settings.
      The API name is "solution-settings/theme" even though it deals with diagnosticsOptIn,
      AzureMapsKeys, name, description and UI theme. */
    static getSolutionSettings() {
        return HttpClient.get(`${ENDPOINT}solution-settings/theme`).pipe(
            map(toSolutionSettingThemeModel),
            /* When the application loads for the first time, there won't be "solution-settings"
       in the storage. In that case, service will throw a 404 not found error.
       But we need to ignore that and stick with the static values defined in UI state */
            catchError((error) =>
                error.status === 404 ? EMPTY : throwError(error)
            )
        );
    }

    /* Update solution settings.
     The API name is "solution-settings/theme" even though it deals with diagnosticsOptIn,
      AzureMapsKeys, name, description and UI theme.*/
    static updateSolutionSettings(model) {
        return HttpClient.put(`${ENDPOINT}solution-settings/theme`, model).pipe(
            map(toSolutionSettingThemeModel)
        );
    }

    static setDefaultFirmwareSetting(model) {
        return HttpClient.post(
            `${ENDPOINT}solution-settings/defaultFirmware`,
            model
        );
    }

    static getDefaultFirmwareSetting() {
        return HttpClient.get(
            `${ENDPOINT}solution-settings/defaultFirmware`
        ).pipe(
            catchError((error) =>
                this.catch404(error, backupDefaultFirmwareModel)
            ),
            map(toSolutionSettingFirmwareModel)
        );
    }

    static getActionSettings() {
        return HttpClient.get(`${ENDPOINT}solution-settings/actions`).pipe(
            map(toSolutionSettingActionsModel)
        );
    }

    /** Creates a new package */
    static createPackage(packageModel) {
        let options = {
            headers: {
                Accept: undefined,
                "Content-Type": undefined,
            },
        };
        return HttpClient.post(
            `${ENDPOINT}packages`,
            toNewPackageRequestModel(packageModel),
            options
        ).pipe(map(toPackageModel));
    }
    /** Creates a new package */
    static uploadFirmware(firmwareFile) {
        let options = {
            headers: {
                Accept: undefined,
                "Content-Type": undefined,
            },
            timeout: 300000, // 5 min
        };
        return HttpClient.post(
            `${ENDPOINT}packages/UploadFile`,
            toNewFirmwareUploadRequestModel(firmwareFile),
            options
        ).pipe(map(toFirmwareModel));
    }

    /** Returns all the account's packages */
    static getPackages(deviceGroup) {
        return HttpClient.get(
            `${ENDPOINT}packages?tags=devicegroup.*&tags=devicegroup.${deviceGroup}&tagOperator=OR`
        ).pipe(map(toPackagesModel));
    }

    /** Returns filtered packages */
    static getFilteredPackages(deviceGroup, packageType, configType) {
        return HttpClient.get(
            `${ENDPOINT}packages?packagetype=${packageType}&configtype=${configType}&tags=%5B%22devicegroup.*%22%2C+%22devicegroup.${deviceGroup}%22%5D&tagOperator=OR`
        ).pipe(map(toPackagesModel));
    }

    static activatePackage(id) {
        return HttpClient.delete(
            `${ENDPOINT}packages/${id}/tags/${INACTIVE_PACKAGE_TAG}`
        ).pipe(map(toPackageModel));
    }

    static deactivatePackage(id) {
        return HttpClient.put(
            `${ENDPOINT}packages/${id}/tags/${INACTIVE_PACKAGE_TAG}`
        ).pipe(map(toPackageModel));
    }

    static addPackageTag(id, tag) {
        return HttpClient.put(`${ENDPOINT}packages/${id}/tags/${tag}`).pipe(
            map(toPackageModel)
        );
    }

    static removePackageTag(id, tag) {
        return HttpClient.delete(`${ENDPOINT}packages/${id}/tags/${tag}`).pipe(
            map(toPackageModel)
        );
    }

    /** Returns all the account's packages */
    static getConfigTypes() {
        return HttpClient.get(`${ENDPOINT}configtypes`).pipe(
            map(toConfigTypesModel)
        );
    }

    /** Delete a package */
    static deletePackage(id) {
        return HttpClient.delete(`${ENDPOINT}packages/${id}`).pipe(
            map((_) => id)
        );
    }

    static catch404(error, continueAs) {
        return error.status === 404 ? of(continueAs) : throwError(error);
    }

    static getColumnMappings() {
        return HttpClient.get(`${ENDPOINT}columnmapping`).pipe(
            map(toColumnMappings)
        );
    }

    static createColumnMappings(payload) {
        return HttpClient.post(`${ENDPOINT}columnmapping`, payload, {
            timeout: 120000,
        }).pipe(map(toColumnMapping));
    }

    static updateColumnMappings(id, payload) {
        return HttpClient.put(`${ENDPOINT}columnmapping/${id}`, payload, {
            timeout: 120000,
        }).pipe(map(toColumnMapping));
    }

    static deleteColumnMapping(id) {
        return HttpClient.delete(`${ENDPOINT}columnmapping/${id}`).pipe(
            map((_) => id)
        );
    }

    static getColumnOptions() {
        return HttpClient.get(`${ENDPOINT}columnmapping/ColumnOptions`).pipe(
            map(toColumnOptions)
        );
    }

    static saveColumnOptions(payload) {
        return HttpClient.post(
            `${ENDPOINT}columnmapping/ColumnOptions`,
            payload,
            { timeout: 120000 }
        ).pipe(map(toColumnOption));
    }

    static updateColumnOptions(id, payload) {
        return HttpClient.put(
            `${ENDPOINT}columnmapping/ColumnOptions/${id}`,
            payload,
            { timeout: 120000 }
        ).pipe(map(toColumnOption));
    }
}
