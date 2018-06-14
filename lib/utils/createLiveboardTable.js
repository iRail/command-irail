'use strict';

/**
 * Created by pascalvanhecke on 09/03/17.
 */
const Table = require('cli-table3');
const DateFormat = require("./DateFormat");

const createLiveboardTable = departures => {

    var table = new Table({
        head: ['Spoor', 'Bestemming', 'Aankomst', 'Vertraging'],
        style: {
            head: [] //disable colors in header cells
            , border: [] //disable colors for the border
        },
        colWidths: [10, 25, 12, 12] //set the widths of each column (optional)
    });

    let counter = 1;
    for (let departure of departures) {
        let value = [departure.platform, departure.station, DateFormat.irail(departure.time), `${Math.round(departure.delay / 60)} min.`];

        table.push(value);
        counter++;
    }
    return table;
};

module.exports = createLiveboardTable;