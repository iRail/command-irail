-- Up
CREATE TABLE IF NOT EXISTS Stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    stationURI TEXT,
    stationID TEXT,
    lattitude REAL ,
    longitude REAL ,
    name VARCHAR(256),
    sqltime TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

-- Down
DROP TABLE Stations;