/**
 * Created by pascalvanhecke on 06/03/17.
 */
const dateFormat = require('dateformat');
dateFormat.masks.trainTime = 'HH:MM';

const DateFormat = {

    irail: (unixEpoch)=> {
        return dateFormat(new Date(unixEpoch * 1000), "trainTime")
    },

    duration: (departureTime, arrivalTime)=> {
        const startDate = new Date(departureTime * 1000)
        const endDate = new Date(arrivalTime * 1000)
        const _MS_PER_HOUR = 1000 * 60
        const difference = endDate - startDate;
        return Math.floor(difference / _MS_PER_HOUR);
    }
}

module.exports = DateFormat;