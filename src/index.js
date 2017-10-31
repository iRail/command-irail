#!/usr/bin/env node
"use strict";
const ArgumentParser = require("argparse").ArgumentParser;

const Irail = require("./Irail");
const packageJson = require("./../package.json");

var parser = new ArgumentParser({
  version: packageJson.version,
  description: "Irail command line"
});

parser.addArgument(["-l", "--last"], {
  nargs: 0,
  help: "repeats last searched route"
});

parser.addArgument(["-lb", "--liveboard"], {
  nargs: 0,
  help: "get live board for the given station"
});

parser.addArgument(["-de", "--depart"], {
  nargs: 0,
  help: "depart at certain time"
});

parser.addArgument(["-ar", "--arrive"], {
  nargs: 0,
  help: "arrive at certain time"
});

var args = parser.parseArgs();

const irail = new Irail();

async function run() {
  let routes;
  switch (true) {
    case args.last != null:
      routes = await irail.lastFromHistoryFlow();
      break;
    case args.liveboard != null:
      routes = await irail.liveboard();
      break;
    case args.arrive != null:
      routes = await irail.fromToFlow('arrival');
      break;
    case args.depart != null:
      routes = await irail.fromToFlow('depart');
      break;
    default:
        routes = await irail.fromToFlow();
      break
  }

  if (routes) {
    console.log(routes);
  }
}

run();
