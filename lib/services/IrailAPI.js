"use strict";

/**
 * Created by pascalvanhecke on 05/03/17.
 */

const BASE_URL = "https://irail.be/";
const BASE_API_URL = "https://api.irail.be/";
var options = {
  baseUrl: BASE_API_URL,
  json: true,
  simple: false,
  resolveWithFullResponse: true,
  qs: {
    format: "json"
  }
};

const request = require("request-promise").defaults(options);

class IrailAPI {

  getAllStations() {
    const options = {
      baseUrl: BASE_URL,
      uri: "stations/NMBS"
    };
    return request.get(options);
  }

  routeFromTo(from, to) {
    const options = {
      uri: "connections/",
      qs: {
        from,
        to
      }
    };

    return request.get(options);
  }

  liveboard(station) {
    const options = {
      uri: "liveboard/",
      qs: {
        station,
        fast: true
      }
    };

    return request.get(options);
  }
}

module.exports = IrailAPI;