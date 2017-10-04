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
      default:
        routes = await irail.fromToFlow();
      break
  }

  if (routes) {
    console.log(routes);
  }
}

run();
