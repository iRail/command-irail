const cli = require('cli');
const Table = require('cli-table');
const IrailAPI = require('./services/IrailAPI');

const StorageAPI = require('./services/StorageAPI');
const irailAPI = new IrailAPI();
const storageAPI = new StorageAPI();
const autoCompletePromise = require('./utils/autocompletePromise');
const DateFormat = require('./utils/DateFormat');

storageAPI.connect().then(async()=> {
    //const stationsResult = await irailAPI.getAllStations();
    //await storageAPI.insertStations(stationsResult.body['@graph']);
    const stations = await storageAPI.selectAllStations();

    const suggestedStations = (input) => Promise.resolve(stations
        .filter((color) => color.title.slice(0, input.length).toLowerCase() === input.toLowerCase() && input.length > 1));

    const from = await autoCompletePromise.stations(suggestedStations, 'Van welk station zou je vertrekken?');
    const to = await autoCompletePromise.stations(suggestedStations, 'Naar welk station wil je reizen?');

    const travel = await irailAPI.routeFromTo(from, to);
    const connections = travel.body.connection;

    printConnections(connections)
});

const printConnections = (connections)=> {
    var table = new Table({head: ["","Vertrek", "Aankomst"]});

    let counter = 1;
    for (let connection of connections) {
        const departure = connection.departure;
        const arrival = connection.arrival;
        const keyValue = counter.toString();
        let value = {}

        value[keyValue] = [, departure.station + " " + DateFormat.irail(departure.time), arrival.station + " " + DateFormat.irail(arrival.time)]
        table.push(value);
        counter++;

    }

    console.log(table.toString())


}


//cli.spinner('Working..');

setTimeout(function () {
    //  cli.spinner('Working.. done!', true); //End the spinner
}, 3000);