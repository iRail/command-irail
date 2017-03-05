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
            .then(() => db.migrate({force: 'last'}))
            .catch(err => console.error(err.stack));
    }

    /**
     * stationURI TEXT,
     stationID TEXT,
     lattitude REAL ,
     longitude REAL ,
     name VARCHAR(256),
     sqltime TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
     */
    async insertStations(stations) {
        await db.run("BEGIN TRANSACTION");
        const stmt = await db.prepare("INSERT INTO stations VALUES(?,?,?,?,?,?,?)");

        for (let station of stations) {
            await stmt.run(null, station['@id'], station['@id'], station.lattitude, station.longitude, station.name, new Date());
        }
        stmt.finalize();
        db.run("COMMIT TRANSACTION");
    }
}

module.exports = StorageAPI;