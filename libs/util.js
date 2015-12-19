'use strict';

var AzureService = require('../services/azure');

var fs           = require('fs');
var Q            = require('q');
var config       = require('./config');
var log          = require('bunyan').createLogger(config.bunyan);

var utils = {
    deleteFile: function (options) {
        var df = Q.defer();
        var fileName = options.fileName || null;
        var isLogFile = options.isLogFile || false;

        if (!isLogFile) {
            log.info('Utility: Attempting to delete local instance of [ %s ]', fileName);
        }

        fs.unlink(fileName, function (error) {
            if (error) { 
                log.info(error);
                df.reject(error); 
            }

            if (!isLogFile) {
                log.info('Utility: [ %s ] has been deleted', fileName);
            }
            
            df.resolve();
        });

        return df.promise;
    },

    handleError: function (err) { 
        log.info(err); 
    }
};

module.exports = utils;