-- Up
CREATE TABLE IF NOT EXISTS History (
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    fromId INTEGER ,
    toId INTEGER ,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY(fromId) REFERENCES Stations(stationURI),
    FOREIGN KEY(toId) REFERENCES Stations(stationURI)
        );

-- Down
DROP TABLE History;