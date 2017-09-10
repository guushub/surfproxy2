import * as http from 'http';
import * as Promise from 'promise';

import * as Config from './config';
import { RwsStation } from './station';
import * as RwsData from './data';

const port = 8001;

let configApp: Config.IConfigApp;
let configPars: Config.IConfigRwsPar[];
let configStations: Config.IConfigRwsStation[];

let stations: RwsStation[] = [];
let dataExpired = true;

console.log("Starting RWS data proxy...");
Config.loader<Config.IConfigApp>(`${__dirname}/../config/config.json`)
  .then(config => {
    configApp = config;
    return Config.loader<Config.IConfigRwsStation[]>(`${__dirname}/../config/rws_stations.json`);

  })
  .then(config => {
    configStations = config;
    return Config.loader<Config.IConfigRwsPar[]>(`${__dirname}/../config/rws_par.json`);
  })
  .then((config) => {
    configPars = config;
    configStations.forEach((configStation) => {
      configPars.forEach((configPar) => {
        stations.push(new RwsStation(configStation, configPar));
      })
    })

    http.createServer((req, res) => {
      getJson()
        .then(json => {
          res.write(json);
          res.end();
        })

    }).listen(port);

    console.log(`Server running on http://localhost:${port}`);

  })
  .catch(error => {
    console.log("Error in RWS dataproxy:", error);
  });

const getJson = () => {
  return new Promise((resolve, reject) => {
    //if (dataExpired) {
      Promise.all(stations.map((station) => RwsData.add(station, configApp)))
        .then(stationsWithData => {
          stations = stationsWithData;
          // dataExpired = false;

          // setTimeout(toggleExpiration, 10 * 60 * 1000);

          resolve(JSON.stringify({ features: stations }));
        })
        .catch(error => {
          JSON.stringify(error);
        });
    //} else {
      //resolve(JSON.stringify({ features: stations }));
    //}
  });
}

const toggleExpiration = () => {
  dataExpired = !dataExpired;
}




