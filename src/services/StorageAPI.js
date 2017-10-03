/**
 * Created by pascalvanhecke on 05/03/17.
 */
const db = require('sqlite');


class StorageAPI {

    constructor(directory) {
        this.directory = directory
    }

    async connect() {
        console.log('this.directory', this.directory)
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
                force: true,
                migrationsPath: this.directory + "/migrations",
            });
        } catch (error) {
            console.log("ERROR - ", error)
            throw error
        }


    }

    async hasStations() {
        return db.all('SELECT * FROM Stations LIMIT 1');
    }

    /**
     * takes the array fetched from irail api and inserts it into the sqlite
     * into table Stations
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

    /**
     * saves the
     * @param from
     * @param to
     * @returns {Promise<Statement>|*}
     */
    saveToHistory(from, to) {
        return db.run("INSERT INTO History (fromId, toId) VALUES ($fromId, $toId)", {
            $fromId: from,
            $toId: to,
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


module.exports =  StorageAPI;