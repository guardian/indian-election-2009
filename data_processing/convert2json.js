var fs = require('fs');
var csv = require('csv');
var _ = require('underscore');
var constituencies = [];
var currentCon = {};

function sortCandidates(candidates) {
    var sortedCandidates = _.sortBy(candidates, function(candidate) {
        return parseInt(candidate.votes_secured.total, 10) * -1;
    });

    return _.each(sortedCandidates, function(can, index) {
        can.position = index +1;
    });
}

function createConstituency(row) {
    return {
        'state': row[0],
        'constituency': row[1],
        'total_electors': row[2],
        'candidates': [],
        'aap_standing': row[14],
        'location': {
            'lat': row[15],
            'lng': row[16]
        },
    };
}

function createCandidate(row) {
    return {
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
}

function finaliseData() {
    // Sort candidates by total votes
    constituencies.forEach(function(constituency) {
        constituency.candidates = sortCandidates(constituency.candidates);
    });

    // Output JSON file
    var stream = fs.createWriteStream('processed_data.json');
    stream.once('open', function() {
        stream.write(JSON.stringify(constituencies, null, '  '));
        stream.end();
    });
}

function processRow(row, index) {
    // Skip header column
    if (index === 0) return;
    // 1st candidate signifies the beginning of a new constituency
    if (parseInt(row[3], 10) === 1) {
        constituencies.push(createConstituency(row));
    }

    var currentConstituecy = constituencies[constituencies.length - 1];
    currentConstituecy.candidates.push(createCandidate(row));
}

csv()
    .from.stream(fs.createReadStream(__dirname + '/source_data/results.csv'))
    .on('record',processRow)
    .on('end', finaliseData);
