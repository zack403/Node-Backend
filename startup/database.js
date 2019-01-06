const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');


module.exports = function() {
    const db = config.get('database');
    mongoose.connect(db)
     .then(() => winston.info(`connected to ${db}...`));
}