// Setup
var outputContainer = document.querySelector('#output');
var data;


// Data wrangling inside here
function countBJPWinners() {

    var winningBJP = [];

    data.forEach(function( constituency ) {
        constituency.candidates.forEach(function( candidate ) {
            if ( candidate.party === 'BJP' ) {
                if (candidate.position === 1 || candidate.position === 2) {
                    winningBJP.push(candidate);
                }
            }
        });
    });


    outputData('BJP in 1st or 2nd: ' + winningBJP.length);
}


function mostMarginalSeats() {
    data.sort(function(a, b) {
        return (a.candidates[0].votes_secured.total - a.candidates[1].votes_secured.total) -
            (b.candidates[0].votes_secured.total - b.candidates[1].votes_secured.total);
    });

    for( var i = 0; i < 3; i++) {

        var diff = data[i].candidates[0].votes_secured.total - data[i].candidates[1].votes_secured.total;
        outputData('Marginal seat ' + i + ': ' + data[i].constituency + ', diff: ' +  diff);

    }
}


function safestSeats() {
    data.reverse();

    for( var i = 0; i < 3; i++) {
        var diff = data[i].candidates[0].votes_secured.total - data[i].candidates[1].votes_secured.total;
        outputData('Safest seat ' + i + ': ' + data[i].constituency + ', diff: ' +  diff);
    }
}

// Inner workings
function handleJSONSuccess(_data) {
    data = _data;
    // Processing tasks
    countBJPWinners();
    mostMarginalSeats();
    safestSeats();
}

function outputData(data) {
    outputContainer.innerHTML += JSON.stringify(data) + '\n';
}

function handleJSONError() {
    console.error('Problem fetching JSON');
}

$.getJSON('processed_data.json')
    .done(handleJSONSuccess)
    .fail(handleJSONError);
