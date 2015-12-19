'use strict';

var https    = require('https');
var fs       = require('fs');
var config   = require('../libs/config');
var Q        = require('q');
var log      = require('bunyan').createLogger(config.bunyan);


var api = {

    init: function (config) {
        this.file = config.file || null;
        this.requestOptions = config.requestOptions || null;
    },

    downloadDataAndSaveToFile: function () {
        var stream = fs.createWriteStream(this.file);
        var df = Q.defer();
        
        log.info('API: Initiate request');

        var request = https.request(this.requestOptions, function (response) {

            log.info('API: Downloading data');
            response.pipe(stream);

            stream.on('finish', function() {
                stream.close();
                df.resolve(this.file);
                log.info('API: Download complete');
            });
        });

        request.on('error', function (error) {
            log.info(error);

            fs.unlink(this.file);
            df.reject(error);
        });

        request.end();

        return df.promise;
    }
};

module.exports = api;