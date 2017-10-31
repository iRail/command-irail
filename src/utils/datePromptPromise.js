/**
 * Created by pascalvanhecke on 05/03/17.
 */
const datePrompt = require("date-prompt");

const datePromptPromise = message => {
  var promise = new Promise(function(resolve, reject) {
    // do a thing, possibly async, then…
    datePrompt(message)
      .on("abort", v => {
        reject("It broke");
      })
      .on("submit", v => {
        resolve(v);
      });
  });

  return promise;
};

module.exports = datePromptPromise;
