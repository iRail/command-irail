"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

  routeFromTo(from, to, dateResult) {
    const queryStringOptions = _extends({
      from,
      to
    }, dateResult);

    const options = {
      uri: "connections/",
      qs: queryStringOptions
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