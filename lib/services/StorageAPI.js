'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by pascalvanhecke on 05/03/17.
 */
const db = require('sqlite');

class StorageAPI {

    constructor(directory) {
        this.directory = directory;
    }

    connect() {
        var _this = this;

        return _asyncToGenerator(function* () {
            try {
                yield db.open(_this.directory + '/database.sqlite');
            } catch (error) {
                console.log('error openening database');
                throw error;
            }
        })();
    }

    migrate() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            try {
                yield db.migrate({
                    force: true,
                    migrationsPath: _this2.directory + "/migrations"
                });
            } catch (error) {
                console.log("ERROR - ", error);
                throw error;
            }
        })();
    }

    hasStations() {
        return _asyncToGenerator(function* () {
            return db.all('SELECT * FROM Stations LIMIT 1');
        })();
    }

    /**
     * takes the array fetched from irail api and inserts it into the sqlite
     * into table Stations
     */
    insertStations(stations) {
        return _asyncToGenerator(function* () {
            try {
                yield db.run("BEGIN TRANSACTION");
                const stmt = yield db.prepare("INSERT INTO Stations VALUES(?,?,?,?,?,?,?)");

                for (let station of stations) {
                    const stationURI = station['@id'];
                    const stationId = stationURI.substr(stationURI.lastIndexOf('/') + 1);
                    yield stmt.run(null, stationURI, stationId, station.latitude, station.longitude, station.name, new Date());
                }

                stmt.finalize();

                db.run("COMMIT TRANSACTION");
            } catch (error) {
                console.log('insert stations', error);
            }
        })();
    }

    selectAllStations() {
        return db.all('SELECT name as title, stationURI as value FROM Stations');
    }

    /**
     * saves the
     * @param from
     * @param to
     * @returns {Promise<Statement>|*}
     */
    saveToHistory(from, to) {
        return db.run("INSERT INTO History (fromId, toId) VALUES ($fromId, $toId)", {
            $fromId: from,
            $toId: to
        });
    }

    /**
     * gets last search from history
     * @returns {Promise<Statement>|*}
     */
    getLastSearchFromHistory() {
        return db.all(`SELECT a.name as fromStation, a.stationURI as fromId,c.name as toStation, c.stationURI as toId, c.updated as updated from History b 
                    JOIN Stations a ON b.fromId=a.stationURI
                    JOIN Stations c ON b.toId=c.stationURI 
                    ORDER by updated DESC
                    LIMIT 1`);
    }
}

module.exports = StorageAPI;