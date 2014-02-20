var fs = require('fs');
var csv = require('csv');
var _ = require('underscore');

var constituencies = [];
var currentCon = {};


function sortCandidates(candidates) {
    var sortedCandidates = _.sortBy(candidates, function(cand) {
        return parseInt(cand.votes_secured.total, 10);
    });

    sortedCandidates = sortedCandidates.reverse();

    _.each(sortedCandidates, function(can, index) {
        can.position = index +1;
    });

    return sortedCandidates;
}

csv()
    .from.stream(fs.createReadStream(__dirname + '/final_final.csv'))
    .on('record', function(row, index) {
        if (index === 0) return;

        if (parseInt(row[3], 10) === 1) {

            if (currentCon.candidates && currentCon.candidates.length > 0) {
                currentCon.candidates = sortCandidates(currentCon.candidates);
                constituencies.push(currentCon);
            }

            currentCon = {
                'state': row[0],
                'constituency': row[1],
                'total_electors': row[2],
                'candidates': [],
                'aap_standing': row[14],
                'location': {
                    'lat': row[15],
                    'lng': row[16]
                }
            };
        }

        var obj = {
                    'sl_no': parseInt(row[3], 10),
                    'candidate_name': row[4],
                    'sex': row[5],
                    'age': parseInt(row[6], 10),
                    'category': row[7],
                    'party': row[8],
                    'votes_secured': {
                        'general': parseInt(row[9], 10),
                        'postal': parseInt(row[10], 10),
                        'total': parseInt(row[11], 10)
                    },
                    'percent_votes_secured': {
                        'over_total_electors_in_constituency': parseFloat(row[12]),
                        'over_total_votes_polled_in_constituency': parseFloat(row[13])
                    }
                };
        currentCon.candidates.push(obj);
    })
    .on('end', function(count) {
        currentCon.candidates = sortCandidates(currentCon.candidates);
        constituencies.push(currentCon);
        var stream = fs.createWriteStream('processed_data.json');
        stream.once('open', function() {
            stream.write(JSON.stringify(constituencies, null, '  '));
            // constituencies.forEach(function(con) {
            //     stream.write(JSON.stringify(con) + '\n');
            // });
            stream.end();
        });

    });

