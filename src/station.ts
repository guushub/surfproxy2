import { IConfigRwsPar, IConfigRwsStation } from './config';
import { IRwsWaterInfoData } from './data';

export class RwsStation {
    locatienaam: string;
    parameternaam: string;
    par: string;
    loc: string;
    waarde: number;
    eenheid: string;
    meettijd: number;
    location: {lat: number, lon: number};
    categoryDescription: string;
    locationSlug: number;
    expertParameter: string;

    constructor(configStation: IConfigRwsStation, configPar: IConfigRwsPar) {
        this.loc = configStation.loc;
        this.locatienaam = configStation.locatienaam;
        this.par = configPar.par;
        this.location = { lat: configStation.lat, lon: configStation.lng };
        this.locationSlug = configStation.locationSlug;
        this.expertParameter = configPar.expertParameter;
    }

    setData(data: IRwsWaterInfoData) {
        this.waarde = data.waarde;
        this.meettijd = data.meettijd;
        
    }

    clearData() {
        const ONE_HOUR = 60 * 60 * 1000;
        if(this.waarde && (Number(new Date()) - Number(this.meettijd)) > ONE_HOUR) {
            this.waarde = null;
            this.meettijd = null;           
        } else {
            this.waarde = null;
            this.meettijd = null;
        }
    }

    getDataUrl(baseUrl: string, timeHorizon: string) {
        return `${baseUrl}?expertParameter=${this.expertParameter}&locationSlug=${this.locationSlug}&timehorizon=${timeHorizon}`;
    }

}