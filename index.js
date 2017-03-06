#! /usr/bin/env node
const cli = require('cli');
const Table = require('cli-table2');
const IrailAPI = require('./services/IrailAPI');

const StorageAPI = require('./services/StorageAPI');
const irailAPI = new IrailAPI();
const storageAPI = new StorageAPI();
const autoCompletePromise = require('./utils/autocompletePromise');
const DateFormat = require('./utils/DateFormat');

async function create() {

    await storageAPI.connect();
    const stationsResult = await irailAPI.getAllStations();

    await storageAPI.insertStations(stationsResult.body['@graph']);
    const stations = await storageAPI.selectAllStations();

    const suggestedStations = (input) => Promise.resolve(stations
        .filter((color) => color.title.slice(0, input.length).toLowerCase() === input.toLowerCase() && input.length > 1));

    const from = await autoCompletePromise.stations(suggestedStations, 'Van welk station zou je vertrekken?');
    const to = await autoCompletePromise.stations(suggestedStations, 'Naar welk station wil je reizen?');

    const travel = await irailAPI.routeFromTo(from, to);
    const connections = travel.body.connection;

    printConnections(connections);
}

;

const printConnections = (connections)=> {
    // For most of these examples, and most of the unit tests we disable colors.
    // It makes unit tests easier to write/understand, and allows these pages to
    // display the examples as text instead of screen shots.
    var table = new Table({
        head: ['From', 'Departure', 'To', 'Arrival', 'duration',]
        , style: {
            head: []    //disable colors in header cells
            , border: []  //disable colors for the border
        }
        , colWidths: [20, 11, 20, 11, 5]  //set the widths of each column (optional)
    });

    let counter = 1;
    for (let connection of connections) {
        const departure = connection.departure;
        const arrival = connection.arrival;

        let value = [
            departure.station,
            DateFormat.irail(departure.time),
            arrival.station,
            DateFormat.irail(arrival.time),
            DateFormat.duration(departure.time, arrival.time) + ' minutes'
        ]

        table.push(value);
        counter++;

    }

    console.log(table.toString())


}

create()


//cli.spinner('Working..');

setTimeout(function () {
    //  cli.spinner('Working.. done!', true); //End the spinner
}, 3000);