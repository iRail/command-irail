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
  async connectAndMigrate() {
    try {
      await storageAPI.connect();
      await storageAPI.migrate();
    } catch (e) {
      console.error(e);
      return;
    }
  }

  /**
     * check if the sqlite database has stations
     * @returns {boolean}
     */
  async hasStations() {
    try {
      const hasStations = await storageAPI.hasStations();

      return hasStations.length > 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
     * fetches all stations from the irail api
     * and saves them to the Stations table
     */
  async syncStations() {
    try {
      await storageAPI.connect();
    } catch (error) {
      console.log(error);
      return;
    }

    try {
      const stationsResult = await irailAPI.getAllStations();
      await storageAPI.insertStations(stationsResult.body["@graph"]);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  async getStationList() {
    try {
      const hasStations = await storageAPI.hasStations();
      if (hasStations.length == 0) {
        await this.syncStations();
      }
    } catch (error) {
      return error;
    }
    let stations = [];
    try {
      stations = await storageAPI.selectAllStations();
      const suggestedStations = input =>
        Promise.resolve(
          stations.filter(
            station =>
              station.title.slice(0, input.length).toLowerCase() ===
                input.toLowerCase() && input.length > 1
          )
        );
      return suggestedStations;
    } catch (error) {
      return error;
    }
  }

  async getDate(type) {
    try {
      const messageType = type === "depart" ? "vertrekken" : "aankomen";
      const message = `Wanneer wil je ${messageType}?'`;
      const dateResult = await datePromptPromise(message);

      return {
        date: dateResult.format("DDMMYY"),
        time: dateResult.format("HHmm"),
        timeSel: type
      };
    } catch (error) {
      console.log(error.toString());
    }
  }

  /**
     * full flow for manually giving the from to flow
     * with a result that gives a routes table
     */
  async fromToFlow(type) {
    try {
      await this.connectAndMigrate();
    } catch (error) {
      return error;
    }

    const suggestedStations = await this.getStationList();

    let from;
    let to;

    try {
      from = await autoCompletePromise.stations(
        suggestedStations,
        "Van welk station zou je vertrekken?"
      );
      to = await autoCompletePromise.stations(
        suggestedStations,
        "Naar welk station wil je reizen?"
      );
    } catch (error) {
      //console.log(error);
      return error;
    }
    let dateResult;

    if (type) {
      try {
        dateResult = await this.getDate(type);
      } catch (error) {
        return error;
      }
    }

    try {
      await storageAPI.saveToHistory(from, to);
      return await this.getRoute(from, to, dateResult);
    } catch (error) {
      return error;
    }
  }

  async lastFromHistoryFlow() {
    try {
      await storageAPI.connect();
    } catch (error) {
      console.log(`can't connect to the database`);
    }

    let lastRoute;

    try {
      const lastRouteFromHistory = await storageAPI.getLastSearchFromHistory();
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
        return await this.getRoute(lastRoute.fromId, lastRoute.toId);
      } catch (error) {
        return;
      }
    }
  }

  async liveboard() {
    await this.connectAndMigrate();
    const suggestedStations = await this.getStationList();
    let station;
    try {
      station = await autoCompletePromise.stations(
        suggestedStations,
        "Van welk station wil je de live data?"
      );
    } catch (error) {
      console.log(error);
      return error;
    }
    const liveboardResult = await irailAPI.liveboard(station);
    const liveboardTable = createLiveboardTable(
      liveboardResult.body.departures.departure
    );
    return liveboardTable.toString();
  }

  async getRoute(from, to, dateResult) {
    try {
      const travel = await irailAPI.routeFromTo(from, to, dateResult);
      const connections = travel.body.connection;
      const connectionsTable = createConnectionTable(connections);

      return connectionsTable.toString();
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Irail;
