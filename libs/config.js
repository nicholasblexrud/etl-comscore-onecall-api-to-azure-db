var moment      = require('moment');
var sql         = require('mssql');
var BunyanSlack = require('bunyan-slack');

var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

var configs = {

    file: {
        name: 'reportitems-' + yesterday + '.csv',
        log: yesterday + '.log'
    },

    api: {
        comscore: {
            client: '',   // add comscore client 
            user: '',     // add comsccore user
            pw: '',       // add comscore pw
            itemId: '',   // add comscore reportitem id
            site: '',     // add comscore report site
            host: '',     // add comscore report host
            startDate: 'yesterday',
            eventFilterId: '', // add comscore eventFilterId
            parameters: '',    // add comscore report parameters
            buildEndpoints: function () {
                return {
                    'credits': '/v1/credits.csv?' + 'client=' + this.client + '&user=' + this.user + '&password=' + this.pw,
                    'reportItem': '/v1/reportitems.csv?' + 'client=' + this.client + '&user=' + this.user + '&password=' + this.pw  + '&site=' + this.site + '&itemid=' + this.itemId + '&startdate=' + this.startDate + '&parameters=' + this.parameters + '&eventfilterid=' + this.eventFilterId
                };
            },

            requestOptions: function () {
                return {
                    host: this.host,
                    path: this.buildEndpoints().reportItem,
                    method: 'get'
                };
            }
        },
    },

    csv: {
        delimiter: '|',
        ignoreEmpty: true,
        trim: true,
        objectMode: true,
        headers: ['empty', 'day', 'shortId', 'language', 'country', 'newVsReturning', 'campaignId', 'componentGroup', 'index', 'cot', 'eventCount']
    },

    azure: {
        storage: {
            nick: {
                ACCOUNT: '', // add azure account
                ACCESS_KEY: '', // add azure access key
                CONTAINER: {
                    BACKUP: '', // container name to upload original csv to
                    LOG: '' //  container name to upload log file to
                }
            },

            client: {
                ACCOUNT: '', // add azure account
                ACCESS_KEY: '', // add azure access key
                CONTAINER: {
                    BACKUP: '', // container name to upload original csv to
                    LOG: '' //  container name to upload log file to
                }
            }
        },

        sql: {
            nick: {
                user: '', // add SQL username
                password: '', // add SQL password
                server: '', // add SQL server name
                database: '', // add SQL server database name
                requestTimeout: 600000,
                options: { encrypt: true }
            },

            msft: {
                user: '', // add SQL username
                password: '', // add SQL password
                server: '', // add SQL server name
                database: '', // add SQL server database name
                requestTimeout: 600000,
                options: { encrypt: true }
            }
        }
    },

    table: {
        column: {
            headers: {
                Day: sql.NVarChar(1000),
                'Short ID': sql.NVarChar(1000),
                Language: sql.NVarChar(1000),
                Location: sql.NVarChar(1000),
                'New vs Returning': sql.NVarChar(1000),
                'Campaign ID': sql.NVarChar(1000),
                'Component Group': sql.NVarChar(1000),
                Index: sql.NVarChar(1000),
                'Event Type': sql.NVarChar(1000),
                'All Events': sql.NVarChar(1000)
            }
        }
    },

    bunyan: {
        name: 'ETL process',
        streams: [
            {
                path: yesterday + '.log'
            },

            {
                stream: new BunyanSlack({
                    webhook_url: '', // add slack webhook 
                    channel: '#heatmapping',
                    username: 'squirrel of the app logs',
                    icon_emoji: ':squirrel:',
                    customFormatter: function (record, levelName) {
                        return {
                            text: record.name + ' [' + levelName + '] > ' + record.msg
                        };
                    }
                })
            },

            {
                stream: process.stdout,
                level: 'info'
            }
        ]
    }
};

module.exports = configs;