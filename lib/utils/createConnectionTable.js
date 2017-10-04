'use strict';

/**
 * Created by pascalvanhecke on 09/03/17.
 */
const Table = require('cli-table2');
const DateFormat = require("./DateFormat");

const createConnectionTable = connections => {

    var table = new Table({
        head: ['Spoor', 'Vertrek', 'Van', 'Aankomst', 'Naar', 'reistijd'],
        style: {
            head: [] //disable colors in header cells
            , border: [] //disable colors for the border
        },
        colWidths: [8, 12, 20, 12, 20, 10] //set the widths of each column (optional)
    });

    let counter = 1;
    for (let connection of connections) {
        const departure = connection.departure;
        const arrival = connection.arrival;
        let value = [departure.platform, DateFormat.irail(departure.time), departure.station, DateFormat.irail(arrival.time), arrival.station, DateFormat.minutesToHoursAndMinutes(DateFormat.duration(departure.time, arrival.time))];

        table.push(value);
        counter++;
    }
    return table;
};

module.exports = createConnectionTable;