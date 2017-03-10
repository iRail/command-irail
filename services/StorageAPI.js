/**
 * Created by pascalvanhecke on 05/03/17.
 */
const db = require('sqlite');


class StorageAPI {

    constructor(directory) {
        this.directory = directory
    }

    async connect() {
        try {
            await db.open(this.directory + '/database.sqlite')
        } catch (error) {
            console.log('error openening database');
            throw error;
        }

    }

    async migrate() {
        try {
            await db.migrate({
                force: 'last',
                migrationsPath: this.directory + "/migrations",
            });
        } catch (error) {
            console.log("ERROR - ", error)
            throw error
        }


    }

    /**
     * takes the array fetched from irail api and inserts it into the sqldatase
     */
    async insertStations(stations) {
        try {
            await db.run("BEGIN TRANSACTION");
            const stmt = await db.prepare("INSERT INTO Stations VALUES(?,?,?,?,?,?,?)");

            for (let station of stations) {
                const stationURI = station['@id']
                const stationId = stationURI.substr(stationURI.lastIndexOf('/') + 1)
                await stmt.run(null, stationURI, stationId, station.latitude, station.longitude, station.name, new Date());
            }

            stmt.finalize();

            db.run("COMMIT TRANSACTION");

        } catch (error) {
            console.log('insert stations', error);
        }
    }

    selectAllStations() {
        return db.all('SELECT name as title, stationURI as value FROM Stations')
    }
}


module.exports = StorageAPI;