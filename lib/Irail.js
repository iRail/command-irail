"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by pascalvanhecke on 10/03/17.
 */
const fs = require("fs");
const path = require("path");

const directory = path.dirname(fs.realpathSync(__filename));

const autoCompletePromise = require("./utils/autocompletePromise");
const datePromptPromise = require("./utils/datePromptPromise");
const createConnectionTable = require("./utils/createConnectionTable");
const createLiveboardTable = require("./utils/createLiveboardTable");

const IrailAPI = require("./services/IrailAPI");
const StorageAPI = require("./services/StorageAPI");

const irailAPI = new IrailAPI();
const storageAPI = new StorageAPI(directory);

class Irail {
  connectAndMigrate() {
    return _asyncToGenerator(function* () {
      try {
        yield storageAPI.connect();
        yield storageAPI.migrate();
      } catch (e) {
        console.error(e);
        return;
      }
    })();
  }

  /**
     * check if the sqlite database has stations
     * @returns {boolean}
     */
  hasStations() {
    return _asyncToGenerator(function* () {
      try {
        const hasStations = yield storageAPI.hasStations();

        return hasStations.length > 0;
      } catch (error) {
        console.log(error);
        return false;
      }
    })();
  }

  /**
     * fetches all stations from the irail api
     * and saves them to the Stations table
     */
  syncStations() {
    return _asyncToGenerator(function* () {
      try {
        yield storageAPI.connect();
      } catch (error) {
        console.log(error);
        return;
      }

      try {
        const stationsResult = yield irailAPI.getAllStations();
        yield storageAPI.insertStations(stationsResult.body["@graph"]);
      } catch (e) {
        console.error(e);
        return;
      }
    })();
  }

  getStationList() {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        const hasStations = yield storageAPI.hasStations();
        if (hasStations.length == 0) {
          yield _this.syncStations();
        }
      } catch (error) {
        return error;
      }
      let stations = [];
      try {
        stations = yield storageAPI.selectAllStations();
        const suggestedStations = function (input) {
          return Promise.resolve(stations.filter(function (station) {
            return station.title.slice(0, input.length).toLowerCase() === input.toLowerCase() && input.length > 1;
          }));
        };
        return suggestedStations;
      } catch (error) {
        return error;
      }
    })();
  }

  getDate(type) {
    return _asyncToGenerator(function* () {
      try {
        const messageType = type === "depart" ? "vertrekken" : "aankomen";
        const message = `Wanneer wil je ${messageType}?'`;
        const dateResult = yield datePromptPromise(message);

        return {
          date: dateResult.format("DDMMYY"),
          time: dateResult.format("HHmm"),
          timeSel: type
        };
      } catch (error) {
        console.log(error.toString());
      }
    })();
  }

  /**
     * full flow for manually giving the from to flow
     * with a result that gives a routes table
     */
  fromToFlow(type) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      try {
        yield _this2.connectAndMigrate();
      } catch (error) {
        return error;
      }

      const suggestedStations = yield _this2.getStationList();

      let from;
      let to;

      try {
        from = yield autoCompletePromise.stations(suggestedStations, "Van welk station zou je vertrekken?");
        to = yield autoCompletePromise.stations(suggestedStations, "Naar welk station wil je reizen?");
      } catch (error) {
        //console.log(error);
        return error;
      }
      let dateResult;

      if (type) {
        try {
          dateResult = yield _this2.getDate(type);
        } catch (error) {
          return error;
        }
      }

      try {
        yield storageAPI.saveToHistory(from, to);
        return yield _this2.getRoute(from, to, dateResult);
      } catch (error) {
        return error;
      }
    })();
  }

  lastFromHistoryFlow() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      try {
        yield storageAPI.connect();
      } catch (error) {
        console.log(`can't connect to the database`);
      }

      let lastRoute;

      try {
        const lastRouteFromHistory = yield storageAPI.getLastSearchFromHistory();
        if (lastRouteFromHistory.length > 0) {
          lastRoute = lastRouteFromHistory[0];
        } else {
          return console.log("no previous routes found");
        }
      } catch (error) {
        console.log("error on lastSearchFromHistory", error);
      }

      if (lastRoute) {
        try {
          return yield _this3.getRoute(lastRoute.fromId, lastRoute.toId);
        } catch (error) {
          return;
        }
      }
    })();
  }

  liveboard() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.connectAndMigrate();
      const suggestedStations = yield _this4.getStationList();
      let station;
      try {
        station = yield autoCompletePromise.stations(suggestedStations, "Van welk station wil je de live data?");
      } catch (error) {
        console.log(error);
        return error;
      }
      const liveboardResult = yield irailAPI.liveboard(station);
      const liveboardTable = createLiveboardTable(liveboardResult.body.departures.departure);
      return liveboardTable.toString();
    })();
  }

  getRoute(from, to, dateResult) {
    return _asyncToGenerator(function* () {
      try {
        const travel = yield irailAPI.routeFromTo(from, to, dateResult);
        const connections = travel.body.connection;
        const connectionsTable = createConnectionTable(connections);

        return connectionsTable.toString();
      } catch (error) {
        console.log(error);
      }
    })();
  }
}

module.exports = Irail;