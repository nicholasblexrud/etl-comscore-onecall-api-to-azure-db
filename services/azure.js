'use strict';

var Q        = require('q');
var config   = require('../libs/config');
var azure    = require('azure-storage');
var log      = require('bunyan').createLogger(config.bunyan);


var azureService = {

    init: function (config) {
        this.container = config.container || null;
        this.account = config.account || null;
        this.key = config.key || null;
        this.file = config.file || null;
        this.isLogFile = config.isLogFile || false;
        this.blob = azure.createBlobService(this.account, this.key);
    },

    uploadLocalFileToStorage: function () {
        var df = Q.defer();
        var self = this;

        if (!this.isLogFile) {
            log.info('Azure: Initiate file upload');
        }

        this.blob.createBlockBlobFromLocalFile(this.container, this.file, this.file, function (error) {
            if (error) { 
                log.info(error); 
                df.reject(error); 
            }

            if (!self.isLogFile) {
                log.info('Azure: [ %s ] was successfully uploaded to storage container: [ %s ]', self.file, self.container);
            }

            df.resolve(self.file);
        });

        return df.promise;
    }
};

module.exports = azureService;