/**
 * Created by pascalvanhecke on 05/03/17.
 */
const db = require('sqlite');

class StorageAPI {
    constructor() {

    }

    connect() {
        return Promise.resolve()
            .then(() => db.open('./database.sqlite', {Promise}))
            .then(() => db.migrate({force: false}))
            .catch(err => console.error(err.stack));
    }

    /**
     * takes the array fetched from irail api and inserts it into the sqldatase
     */
    async insertStations(stations) {
        try {
            await db.run("BEGIN TRANSACTION");
            const stmt = await db.prepare("INSERT INTO stations VALUES(?,?,?,?,?,?,?)");

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