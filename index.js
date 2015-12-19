'use strict';

var AzureService = require('./services/azure');
var SQLService   = require('./services/sql');
var APIService   = require('./services/api');

var config       = require('./libs/config');
var util         = require('./libs/util');
var log          = require('bunyan').createLogger(config.bunyan);

// Initialize Services
APIService.init({
    file: config.file.name,
    requestOptions: config.api.comscore.requestOptions()
});

SQLService.init({
    tableName: 'rawReportData',
    file: config.file.name,
    dbInfo: config.azure.sql.client,
    storedProcedureName: '' // enter in a stored procedure - if applicable
});

AzureService.init({
    container: config.azure.storage.client.CONTAINER.BACKUP,
    account: config.azure.storage.client.ACCOUNT,
    key: config.azure.storage.client.ACCESS_KEY,
    file: config.file.name
});

/*
    Start ETL Process
 */

// Extracts data from OneCall API
APIService.downloadDataAndSaveToFile()

    // Transforms data into SQL table
    .then(function () { return SQLService.insertDataIntoTable(); })
    .then(function () { return SQLService.connectToSQL(); })
    .then(function () { return SQLService.performBulkInsert(); })
    .then(function () { return SQLService.runStoredProcedure(); })
    .then(function () { return SQLService.closeConnection(); })

    // Loads CSV file into Azure storage
    .then(function () { return AzureService.uploadLocalFileToStorage(); })
    .then(function () { return util.deleteFile({fileName: AzureService.file }); })

    // Upload Log file into Azure storage
    .fin(function () {

        AzureService.init({
            container: config.azure.storage.client.CONTAINER.LOG,
            account: config.azure.storage.client.ACCOUNT,
            key: config.azure.storage.client.ACCESS_KEY,
            file: config.file.log,
            isLogFile: true
        });

        log.info('Utility: Uploading log file [ %s ] to Azure storage container [ %s ]', AzureService.file, AzureService.container);

        return AzureService.uploadLocalFileToStorage()
                    .then(function () { return util.deleteFile({fileName: AzureService.file, isLogFile: true }); })
                    .fail(util.handleError)
                    .done();

    })

    .fail(util.handleError)

    .done();

/*
    End ETL Process
 */

