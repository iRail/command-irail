-- Up
CREATE TABLE IF NOT EXISTS Stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    stationURI TEXT UNIQUE NOT NULL,
    stationID TEXT,
    lattitude REAL ,
    longitude REAL ,
    name VARCHAR(256),
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

-- Down
DROP TABLE Stations;