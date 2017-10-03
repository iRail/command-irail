'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
                yield storageAPI.insertStations(stationsResult.body['@graph']);
            } catch (e) {
                console.error(e);
                return;
            }
        })();
    }

    /**
     * full flow for manually giving the from to flow
     * with a result that gives a routes table
     */
    fromToFlow() {
        var _this = this;

        return _asyncToGenerator(function* () {
            try {
                yield _this.connectAndMigrate();
            } catch (error) {
                return error;
            }

            try {
                const hasStations = yield storageAPI.hasStations();
                if (hasStations.length == 0) {
                    yield _this.syncStations();
                }
            } catch (error) {
                return error;
            }
            let suggestedStations;
            try {
                const stations = yield storageAPI.selectAllStations();
                suggestedStations = function (input) {
                    return Promise.resolve(stations.filter(function (station) {
                        return station.title.slice(0, input.length).toLowerCase() === input.toLowerCase() && input.length > 1;
                    }));
                };
            } catch (error) {
                return error;
            }

            let from;
            let to;

            try {
                from = yield autoCompletePromise.stations(suggestedStations, 'Van welk station zou je vertrekken?');
                to = yield autoCompletePromise.stations(suggestedStations, 'Naar welk station wil je reizen?');
            } catch (error) {
                //console.log(error);
                return error;
            }

            try {
                yield storageAPI.saveToHistory(from, to);
                return yield _this.getRoute(from, to);
            } catch (error) {
                return error;
            }
        })();
    }

    lastFromHistoryFlow() {
        var _this2 = this;

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
                    return console.log('no previous routes found');
                }
            } catch (error) {
                console.log('error on lastSearchFromHistory', error);
            }

            if (lastRoute) {
                try {
                    return yield _this2.getRoute(lastRoute.fromId, lastRoute.toId);
                } catch (error) {
                    return;
                }
            }
        })();
    }

    getRoute(from, to) {
        return _asyncToGenerator(function* () {
            try {
                const travel = yield irailAPI.routeFromTo(from, to);
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