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

        await this.connectAndMigrate();

        const hasStations = await storageAPI.hasStations();

        if (!hasStations) {
            await this.syncStations();
        }

        const stations = await storageAPI.selectAllStations();

        const suggestedStations = (input) => Promise.resolve(stations.filter((station) => station.title.slice(0, input.length).toLowerCase() === input.toLowerCase() && input.length > 1));

        let from;
        let to;

        try {
            from = await autoCompletePromise.stations(suggestedStations, 'Van welk station zou je vertrekken?');
            to = await autoCompletePromise.stations(suggestedStations, 'Naar welk station wil je reizen?');
        } catch (error) {
            //console.log(error);
            return;
        }

        try {
            const travel = await irailAPI.routeFromTo(from, to);
            const connections = travel.body.connection;
            const routesTabel = createConnectionTable(connections);
            return routesTabel.toString();
        } catch (error) {
            console.log(error)
        }


    }
}

module.exports = Irail;