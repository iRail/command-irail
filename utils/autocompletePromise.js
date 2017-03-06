/**
 * Created by pascalvanhecke on 05/03/17.
 */
const autocompletePrompt = require('cli-autocomplete')

autocompletePromise = {
    stations: (stationFilter, promptMessage)=> {
        var promise = new Promise(function (resolve, reject) {
            // do a thing, possibly async, then…
            autocompletePrompt(promptMessage, stationFilter)
                .on('abort', (v) => {
                    reject(Error("It broke"));
                })
                .on('submit', (v) => {
                    resolve(v)
                })

        });

        return promise

    }
}

module.exports = autocompletePromise;