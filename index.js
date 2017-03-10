#! /usr/bin/env node
'use strict';
const Irail = require('./Irail')

const packageJson = require('./package.json');
console.log(packageJson.version);

var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
    version: packageJson.version,
    description: 'Irail command line'
});

parser.addArgument(
    ['-f', '--favorites'],
    {
        help: 'lists most beloved destinations'
    }
);

parser.addArgument(
    ['-l', '--last'],
    {
        help: 'repeats last search route'
    }
);

var args = parser.parseArgs();
//console.dir(args);
const irail = new Irail();

async function run() {
    const routes = await irail.fromToFlow();
    if (routes) {
        console.log(routes);
    }

}

run();