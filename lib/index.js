#!/usr/bin/env node

"use strict";

let run = (() => {
  var _ref = _asyncToGenerator(function* () {
    let routes;
    switch (true) {
      case args.last != null:
        routes = yield irail.lastFromHistoryFlow();
        break;
      case args.liveboard != null:
        routes = yield irail.liveboard();
        break;
      default:
        routes = yield irail.fromToFlow();
        break;
    }

    if (routes) {
      console.log(routes);
    }
  });

  return function run() {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

run();