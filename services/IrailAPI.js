/**
 * Created by pascalvanhecke on 05/03/17.
 */

const BASE_URL = 'https://irail.be/';

var options = {
    baseUrl: BASE_URL,
    json: true,
    simple: false,
    resolveWithFullResponse: true,
    qs: {
        format: "json"
    }
};

const request = require('request-promise').defaults(options);

class IrailAPI {
    constructor() {

    }

    getAllStations() {
        return request.get('stations/NMBS');
    }

    routeFromTo(from, to) {
        const options =
        {
            uri: 'connections/',
            qs: {
                from,
                to,
            }
        }

        return request.get(options);
    }
}

module.exports = IrailAPI;