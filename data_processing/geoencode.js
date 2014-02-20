var csv = require('csv');
var fs = require('fs');
var request = require('request');
var async = require('async');


var locationLookup = {};

var locationsFile = __dirname+'/IN.csv';
locations = fs.createReadStream(locationsFile);
locations.on('end', function(){ console.log('location end'); });
locations.on('error', function(){ console.log('location error'); });
locations.on('close', function(){ console.log('location close'); });



var sourceFile = __dirname+'/final_2.csv';
source = fs.createReadStream(sourceFile);
source.on('end', function(){ console.log('source end'); });
source.on('error', function(){ console.log('source error'); });
source.on('close', function(){ console.log('source close'); });

function findLocations() {
    csv()
        .from(locations, { delimiter: '\t' })
        .on('record', function(row,index){
            var placeName = row[2].toLowerCase().replace(/\W/gi, '');

            if (locationLookup.hasOwnProperty(placeName)) {
                locationLookup[placeName].lat = row[4];
                locationLookup[placeName].lng = row[5];
            }
        })
        .on('error', function(error){
          console.error(error.message);
        })
        .on('end', function() {
            findMissing();
            console.log('finished');
        });
}

function parsePlaces() {
    csv()
        .from(source, { delimiter: ',' })
        .on('record', function(row,index){
            if (index === 0) return;
          if (!locationLookup.hasOwnProperty(row[1])) {
            locationLookup[row[1].split('-')[0].toLowerCase().replace(/\W/gi, '')] = {
                'name': row[1],
                'state': row[0],
                lat: null,
                lng: null
            };
          }
        })
        .on('error', function(error){
          console.error(error.message);
        })
        .on('end', function() {
            findLocations();
            console.log('finished');
        });
}

function findMissing() {
    var missingLocations = [];

    for(var place in locationLookup) {
        //if (locationLookup[place].lat === null) {
            missingLocations.push(locationLookup[place]);
        //}
    }


    async.eachSeries(missingLocations, lookup, outputFile);
}

function lookup(place, callback) {
    var address = place.name + ',' + place.state;
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&region=in&address=';
    url += encodeURI(address);

    console.log('Looking up: ' + address);

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);

            if (data.status == 'OK') {
                place.lat = data.results[0].geometry.location.lat;
                place.lng = data.results[0].geometry.location.lng;
            } else {
                console.log('Google failed to find any results: '  + address);
            }

            setTimeout(function() {
                callback(null);
            }, 500);

        } else {
            callback('Problem geocoding: ' + address);
        }
    });
}

function outputFile() {

    csv()
        .from(sourceFile, { delimiter: ',', escape: '"' })
        .to.stream(fs.createWriteStream(__dirname+'/sample.out'))
        .transform( function(row){
            var lat = 'NA';
            var lng = 'NA';

            var placeName = row[1].toLowerCase().replace(/\W/gi, '');
            if (locationLookup.hasOwnProperty(placeName)) {
                lat = locationLookup[placeName].lat || 'NA';
                lng = locationLookup[placeName].lng || 'NA';
            }

            row.push(lat);
            row.push(lng);
          return row;
        })
        .on('close', function(count){
          // when writing to a file, use the 'close' event
          // the 'end' event may fire before the file has been written
          console.log('Number of lines: '+count);
        })
        .on('error', function(error){
          console.log(error.message);
        });
}

parsePlaces();
//outputFile();
