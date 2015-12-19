var assert     = require('chai').assert;
var nock       = require('nock');
var fs         = require('fs');

var https      = require('https');

var ApiService = require('../../services/api');
var config   = require('../../libs/config');

var options = {
    'host': config.mda.host,
    'path': config.buildOneCallEndpoints().reportItem,
    'method': 'get'
};

describe('ApiService', function() {
    describe('downloadReportFromMDA', function () {
        beforeEach(function() {
            nock('https://' + config.mda.host)
                .get(config.buildOneCallEndpoints().reportItem)
                .reply(200, '|Day|MSDN Short ID|Text Label|'); 
        });

        // it('makes the correct https call to OneCall\'s API', function (done) {
        //     var body = '';
        //     var request = https.request(options, function (response) {

        //         //console.log(response);
        //         response.on('data', function (d) { body += d;});
        //         response.on('end', function () { 
        //             assert.equal(body, '|Day|MSDN Short ID|Text Label|');
        //             assert.equal(response.statusCode, '200');
        //             done();
        //         });


        //     });
        //     request.end();
        // });

        it('returns the file name', function () {
            var filename = 'test.csv';

            return ApiService.downloadReportFromMDA(filename).then(function (data) {
                assert.equal(data, filename);
                fs.unlink(filename);
            });
        });

        it('returns a file', function (done) {
            var filename = 'foo.txt';
            ApiService.downloadReportFromMDA(filename);

            fs.exists(filename, function(exists) {
                assert.isTrue(exists);
                done();
            });

            fs.unlink(filename);
        });

        it('has data in the file', function (done) {
            var filename = 'cool.csv';

            function readContent(callback) {
                fs.readFile(filename, 'utf-8', function (err, content) {
                    if (err) {return callback(err); }
                    callback(null, content);
                });
            }

            ApiService.downloadReportFromMDA(filename);

            readContent(function (err, content) {
                if (err) {console.log(err); }
                assert.equal(content, '|Day|MSDN Short ID|Text Label|');
                done();
            });

            fs.unlink(filename);

        });
    });
});