#!/usr/bin/env node
const cli = require('cli');

const IrailAPI = require('./services/IrailAPI');
const StorageAPI = require('./services/StorageAPI');

const irailAPI = new IrailAPI();
const storageAPI = new StorageAPI();

/*
 const autocompletePrompt = require('cli-autocomplete')

 const colors = [
 {title: 'gent sint pieters',    value: '#f00'},
 {title: 'gent dampoort', value: '#ff0'},
 {title: 'green',  value: '#0f0'},
 {title: 'blue',   value: '#00f'},
 {title: 'black',  value: '#000'},
 {title: 'white',  value: '#fff'}
 ]
 const suggestColors = (input) => Promise.resolve(
 colors.filter((color) => color.title.slice(0, input.length) === input && input.length > 2))

 autocompletePrompt('What is your favorite color?', suggestColors)
 .on('abort', (v) => console.log('Aborted with', v))
 .on('submit', (v) => console.log('Submitted with', v))
 */


storageAPI.connect().then(()=> {
    console.log('connected');
    irailAPI.getAllStations().then((response)=> {
        //console.log(response.body);
        //console.log(response.body['@graph'][0]);

        storageAPI.insertStations(response.body['@graph']);
        return
        /*for (let station of response.body['@graph']) {
         console.log(station.name);
         }*/

    });
})


//cli.spinner('Working..');

setTimeout(function () {
    //  cli.spinner('Working.. done!', true); //End the spinner
}, 3000);