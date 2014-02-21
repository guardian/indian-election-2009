// Quick and dity geolocate constituencies

var csv = require('csv');
var fs = require('fs');
var request = require('request');
var async = require('async');
var locationLookup = {};
var sourceFile = __dirname+'/final_2.csv';


var source = fs.createReadStream(sourceFile);
source.on('end', function(){ console.log('source end'); });
source.on('error', function(){ console.log('source error'); });
source.on('close', function(){ console.log('source close'); });

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
            console.log('finished parsePlaces');
        });
}

function findLocations() {
    var locations = [];

    for(var place in locationLookup) {
        locations.push(locationLookup[place]);
    }

    async.eachSeries(locations, lookup, outputFile);
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

            // Lets not hammer Google's API
            setTimeout(function() { callback(null); }, 500);

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