import * as fs from "fs";
import * as Promise from "promise";


// export function rwsPar(configFilePath: string) {
//     return loader<IConfigRwsPar>(configFilePath);
// }

// export function rwsStations(configFilePath: string) {
//     return loader<IConfigRwsStations>(configFilePath);
// }

// export function app(configFilePath: string) {
//     return loader<IConfigApp>(configFilePath);
// }

export function loader<T>(configFilePath: string) {
    return new Promise<T>((resolve, reject) => {
        fs.readFile(configFilePath, (err, contents) => {
            if(err) {
                reject(err);
            }

            resolve(JSON.parse(contents.toString()));
        });
    });
}


export interface IConfigRwsPar {
    par: string;
    expertParameter: string;
}

export interface IConfigRwsStation {
    locationSlug: number;
    locatienaam: string;
    lat: number;
    lng: number;
    loc: string;
}

export interface IConfigApp {
    apiUrl: string;
    timehorizon: string;
}
