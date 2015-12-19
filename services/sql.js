'use strict';

var fs       = require('fs');
var csv      = require('fast-csv');
var _        = require('underscore');
var sql      = require('mssql');
var Q        = require('q');
var config   = require('../libs/config');
var log      = require('bunyan').createLogger(config.bunyan);

var test = {
    request: null,
    connection: null,

    init: function(config) {
        this.tableName = config.tableName || null;
        this.file = config.file || null;
        this.dbInfo = config.dbInfo || null;
        this.storedProcedureName = config.storedProcedureName || null;
        this.table = this.openTable(this.tableName);
    },

    openTable: function (tableName) {
        var table = new sql.Table(tableName);

        table.create = true;

        return table;
    },

    insertDataIntoTable: function () {
        var df = Q.defer();
        var stream = fs.createReadStream(this.file);

        this.buildTableHeader();

        log.info('SQL: Building rows on [ %s ] ', this.tableName);

        csv.fromStream(stream, config.csv)
            .validate(this.removeHeaderRow)
            .on('data', this.handleStreamData.bind(this))
            .on('error', function (error) { df.reject(error); })
            .on('finish', function () { df.resolve(); });

        return df.promise;
    },

    buildTableHeader: function () {
        var self = this;

        log.info('SQL: Building header on [ %s ] ', this.tableName);

        _.each(config.table.column.headers, function (dataType, name) {
            self.table.columns.add(name, dataType, {nullable: true});
        });

    },

    removeHeaderRow: function (data) {
        return data.day !== 'Day';
    },

    handleStreamData: function (data) {
        this.table.rows.add(
            data.day,
            data.shortId,
            data.language, 
            data.country,
            data.newVsReturning,
            data.campaignId,
            data.componentGroup,
            data.index,
            data.cot,
            data.eventCount
        );
    },

    connectToSQL: function () {
        var df =  Q.defer();
        var self = this;

        log.info('SQL: Opening connection to Azure SQL database');


        var connection = new sql.Connection(this.dbInfo, function (error) {
            if (error) { 
                log.info(error);
                df.reject(error);
            }

            log.info('SQL: Connected to Azure SQL database');

            self.connection = connection;
            self.request = new sql.Request(connection);


            df.resolve(connection);

        });

        return df.promise;
    },

    performBulkInsert: function() {
        var df =  Q.defer();

        log.info('SQL: Running Bulk Insert');

        this.request.bulk(this.table, function (error, rowCount) {
            if (error) { 
                log.info(error);
                df.reject(error);
            }

            log.info('SQL: Completed Bulk Insert: [ %s ] row(s) created', rowCount);
            df.resolve();

        });

        return df.promise;
    },

    runStoredProcedure: function() {
        var df =  Q.defer();
        var self = this;

        log.info('SQL: Running Stored Procedure: [ %s ]', this.storedProcedureName);

        this.request.execute(this.storedProcedureName, function (error) {
            if (error) { 
                log.info(error);
                df.reject(error); 
            }

            log.info('SQL: Stored procedure: [ %s ] has run and is complete', self.storedProcedureName);
            df.resolve();

        });

        return df.promise;
    },

    closeConnection: function() {

        log.info('SQL: Closing connection to Azure SQL database');
        this.connection.close();
    }
};

module.exports = test;
