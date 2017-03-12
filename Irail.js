/**
 * Created by pascalvanhecke on 10/03/17.
 */
const fs = require('fs');
const path = require('path');

const directory = path.dirname(fs.realpathSync(__filename));

const autoCompletePromise = require('./utils/autocompletePromise');
const createConnectionTable = require('./utils/createConnectionTable');

const IrailAPI = require('./services/IrailAPI');
const StorageAPI = require('./services/StorageAPI');

const irailAPI = new IrailAPI();
const storageAPI = new StorageAPI(directory);

class Irail {

    async connectAndMigrate() {
        try {
            await storageAPI.connect();
            await storageAPI.migrate();
        }

        catch (e) {
            console.error(e);
            return
        }
    }


    /**
     * check if the sqlite database has stations
     * @returns {boolean}
     */
    async hasStations() {
        try {
            const hasStations = await
                storageAPI.hasStations();

            return hasStations.length > 0;
        }
        catch
            (error) {
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
        }
        catch (error) {
            console.log(error);
            return;
        }

        try {
            const stationsResult = await irailAPI.getAllStations();
            await storageAPI.insertStations(stationsResult.body['@graph']);
        } catch (e) {
            console.error(e);
            return
        }
    }

    /**
     * full flow for manually giving the from to flow
     * with a result that gives a routes table
     */
    async fromToFlow() {
        try {
            await this.connectAndMigrate();
        } catch (error) {
            return error;
        }

        try {
            const hasStations = await storageAPI.hasStations();
            if (hasStations.length == 0) {
                await this.syncStations();
            }
        } catch (error) {
            return error;
        }
        let suggestedStations;
        try {
            const stations = await storageAPI.selectAllStations();
            suggestedStations = (input) => Promise.resolve(stations.filter((station) => station.title.slice(0, input.length).toLowerCase() === input.toLowerCase() && input.length > 1));
        } catch (error) {
            return error;
        }


        let from;
        let to;

        try {
            from = await autoCompletePromise.stations(suggestedStations, 'Van welk station zou je vertrekken?');
            to = await autoCompletePromise.stations(suggestedStations, 'Naar welk station wil je reizen?');
        } catch (error) {
            //console.log(error);
            return error;
        }

        try {
            await storageAPI.saveToHistory(from, to)
            return await this.getRoute(from, to);
        } catch (error) {
            return error
        }

    }

    async lastFromHistoryFlow() {
        try {
            await storageAPI.connect();
        } catch (error) {
            console.log(`can't connect to the database`)
        }

        let lastRoute;

        try {
            const lastRouteFromHistory = await storageAPI.getLastSearchFromHistory();
            if (lastRouteFromHistory.length > 0) {
                lastRoute = lastRouteFromHistory[0];
            } else {
                return console.log('no previous routes found')
            }
        } catch (error) {
            console.log('error on lastSearchFromHistory', error)
        }

        if (lastRoute) {
            try {
                return await this.getRoute(lastRoute.fromId, lastRoute.toId);
            } catch (error) {
                return
            }
        }
    }

    async getRoute(from, to) {
        try {
            const travel = await irailAPI.routeFromTo(from, to);
            const connections = travel.body.connection;
            const connectionsTable = createConnectionTable(connections);

            return connectionsTable.toString();
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Irail;