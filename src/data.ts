import * as request from 'request';
import * as Promise from 'promise';
import * as csv from 'fast-csv';
//import * as moment from 'moment';
import * as moment from 'moment-timezone';

import { RwsStation } from './station';
import { IConfigApp } from './config';

export const add = (station: RwsStation, configApp: IConfigApp) => {
    return new Promise<RwsStation>((resolve, reject) => {
        get(station.getDataUrl(configApp.apiUrl, configApp.timehorizon))
            .then(data => {
                if(data) {
                    station.setData(data);
                } else {
                    station.clearData();
                }
                resolve(station);
            })
            .catch(error => {
                reject(error);
            })
    });
}

const get = (csvUrl: string) => {
    let resolveRecord: IRwsWaterInfoData = {
        meettijd: null,
        waarde: null,
        eenheid: null
    }

    return new Promise<IRwsWaterInfoData>((resolve, reject) => {
        request(csvUrl, (error, response, body) => {
            if (error) {
                reject(error);
            }

            let currentRecord: IRwsWaterInfoData;

            let csvData = body;
            csv
                .fromString(csvData, { headers: true, delimiter: ';' })
                .on("data", (data) => {
                    currentRecord = {
                        meettijd: Number(rwsDate2JsDate(data.Datum as string, data.Tijd as string)),
                        waarde: parseFloat(data.Meting),
                        eenheid: data.Eenheid as string
                    }

                    if(!isNaN(currentRecord.waarde) && !(currentRecord.waarde === null)) {
                        resolveRecord = currentRecord;
                    }
                })
                .on("end", () => {
                    resolve(resolveRecord);
                });
        });
    });
}



const rwsDate2JsDate = (dateString: string, timeString: string) => {
    let dateArray = dateString.split("-");
    let timeArray = timeString.split(":");

    let hour = parseInt(timeArray[0]);
    let minute = parseInt(timeArray[1]);
    let second = parseInt(timeArray[2]);

    let day = parseInt(dateArray[0]);
    let month = parseInt(dateArray[1]) - 1;
    let year = parseInt(dateArray[2]);

    let jsDate = new Date(year, month, day, hour, minute, second);
    //let offset = jsDate.getTimezoneOffset();

    //jsDate = new Date(Number(jsDate) + offset * 60 * 1000);
    // correct for timezone
    // jsDate.setUTCDate()
    let measureMoment = moment(jsDate);
    let offsetHost = jsDate.getTimezoneOffset();
    let minutesToAdd = 60;
    if( measureMoment.tz("Europe/Amsterdam").isDST() ){
        minutesToAdd = 120;
    }

    let offset = jsDate.getTimezoneOffset() + minutesToAdd;
    jsDate = new Date(jsDate.setTime(jsDate.getTime() - ((offset/60)*60*60*1000)));

    return jsDate;

}

export interface IRwsWaterInfoData {
    meettijd: number;
    waarde: number;
    eenheid: string;
}