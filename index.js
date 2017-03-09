#! /usr/bin/env node
const fs = require('fs');
const path = require('path');

const cli = require('cli');

const IrailAPI = require('./services/IrailAPI');
const StorageAPI = require('./services/StorageAPI');

const autoCompletePromise = require('./utils/autocompletePromise');
const createConnectionTable = require('./utils/createConnectionTable');

const directory = path.dirname(fs.realpathSync(__filename));

const irailAPI = new IrailAPI();
const storageAPI = new StorageAPI(directory);

async function run() {

    try {
        await storageAPI.connect();
        await storageAPI.migrate();
    } catch (e) {
        console.error(e);
        return
    }

    try {
        const stationsResult = await irailAPI.getAllStations();
        await storageAPI.insertStations(stationsResult.body['@graph']);
    } catch (e) {
        console.error(e);
        return
    }

    const stations = await storageAPI.selectAllStations();

    const suggestedStations = (input) => Promise.resolve(stations
        .filter((color) => color.title.slice(0, input.length).toLowerCase() === input.toLowerCase() && input.length > 1));

    let from;
    let to;
    try {
        from = await autoCompletePromise.stations(suggestedStations, 'Van welk station zou je vertrekken?');
        to = await autoCompletePromise.stations(suggestedStations, 'Naar welk station wil je reizen?');
    } catch (error) {
        console.log(error);
        return;
    }

    try {
        const travel = await irailAPI.routeFromTo(from, to);
        const connections = travel.body.connection;
        const table = createConnectionTable(connections);
        console.log(table.toString());
    } catch (error) {

    }

}

run();