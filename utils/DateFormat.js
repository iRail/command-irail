/**
 * Created by pascalvanhecke on 06/03/17.
 */
const dateFormat = require('dateformat');
dateFormat.masks.trainTime = 'HH:MM';

const DateFormat = {
    irail: (unixEpoch)=> {
        return dateFormat(new Date(unixEpoch * 1000), "trainTime")
    }
}

module.exports = DateFormat;