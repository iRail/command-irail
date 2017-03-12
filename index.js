#! /usr/bin/env node
'use strict';
const Irail = require('./Irail')
const packageJson = require('./package.json');

var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
    version: packageJson.version,
    description: 'Irail command line'
});

parser.addArgument(
    ['-l', '--last'],
    {
        nargs: 0,
        help: 'repeats last searched route'
    }
);

var args = parser.parseArgs();

const irail = new Irail();

async function run() {
    let routes;
    if (args.last) {
        routes = await irail.lastFromHistoryFlow();
    } else {
        routes = await irail.fromToFlow();
    }

    if (routes) {
        console.log(routes);
    }
}

run();