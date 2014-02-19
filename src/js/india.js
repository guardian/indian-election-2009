// Setup
var data;


// Data wrangling inside here
function bjp2inc() {
    var tableData = {
        columns: ['state', 'constituency', 'AAP standing'],
        rows: []
    };

    data.forEach(function( constituency ) {
        if ( constituency.candidates[0].party === 'INC' &&  constituency.candidates[1].party === 'BJP'  ) {
            tableData.rows.push([
                constituency.state,
                constituency.constituency,
                constituency.aap_standing
            ]);
        }
    });

    appendTable(tableData, document.querySelector('#target3'));
}


function countBJPWinners() {
    var tableData = {
        columns: ['state', 'constituency', 'position'],
        rows: []
    };

    data.forEach(function( constituency ) {
        constituency.candidates.forEach(function( candidate ) {
            if ( candidate.party === 'BJP' ) {
                if (candidate.position === 1 || candidate.position === 2) {
                    tableData.rows.push([
                        constituency.state,
                        constituency.constituency,
                        candidate.position
                    ]);
                }
            }
        });
    });

    appendTable(tableData, document.querySelector('#bjpSeats'));
}


function mostMarginalSeats() {
    data.sort(function(a, b) {
        return (a.candidates[0].votes_secured.total - a.candidates[1].votes_secured.total) -
            (b.candidates[0].votes_secured.total - b.candidates[1].votes_secured.total);
    });

    var tableData = {
        columns: ['state', 'constituency', '1st party', '1st total', '2nd party', '2nd total', 'diff'],
        rows: []
    };

    for( var i = 0; i < 10; i++) {
        var diff = data[i].candidates[0].votes_secured.total - data[i].candidates[1].votes_secured.total;

        tableData.rows.push([
            data[i].state,
            data[i].constituency,
            data[i].candidates[0].party,
            data[i].candidates[0].votes_secured.total,
            data[i].candidates[1].party,
            data[i].candidates[1].votes_secured.total,
            diff
        ]);
    }

    appendTable(tableData, document.querySelector('#target1'));
}


function safestSeats() {
    data.reverse();

    var tableData = {
        columns: ['state', 'constituency', '1st party', '1st total', '2nd party', '2nd total', 'diff'],
        rows: []
    };

    for( var i = 0; i < 10; i++) {
        var diff = data[i].candidates[0].votes_secured.total - data[i].candidates[1].votes_secured.total;
        tableData.rows.push([
            data[i].state,
            data[i].constituency,
            data[i].candidates[0].party,
            data[i].candidates[0].votes_secured.total,
            data[i].candidates[1].party,
            data[i].candidates[1].votes_secured.total,
            diff
        ]);
    }

    appendTable(tableData, document.querySelector('#target2'));
}


// Inner workings
function handleJSONSuccess(_data) {
    data = _data;
    // Processing tasks
    bjp2inc();
    countBJPWinners();
    mostMarginalSeats();
    safestSeats();
}


function appendTable(_data, _target, _id) {
    var taget = _target || document.body;
    var tableEl = createTableEl(_data, _data.rows.length);
    var id = _id || createRandomID('table_');

    var wrapperEl = document.createElement('div');
    wrapperEl.setAttribute('id', id);
    wrapperEl.appendChild(tableEl);
    taget.appendChild(wrapperEl);

    var valNames = _data.columns.map(function(col) {
        return createID_Name(col);
    });

    var testList = new List(id, { valueNames: valNames });
}


/**
 * Create table
 */
function createTableEl(_data, _rowCount) {
    var rowCount = _rowCount || 10;
    var tableEl = document.createElement('table');
    var theadEl = document.createElement('thead');
    var tbodyEl = document.createElement('tbody');
    var trHeadEl = document.createElement('tr');

    tbodyEl.classList.add('list');
    theadEl.appendChild(trHeadEl);

    // Create head
    _data.columns.forEach(function(col) {
        var th = document.createElement('th');
        th.innerHTML = col;
        th.classList.add('sort');
        th.setAttribute('data-sort', createID_Name(col));
        trHeadEl.appendChild(th);
    });

    // Create body
    _data.rows.forEach(function(row) {
        var tr = document.createElement('tr');
        row.forEach(function(cell, index) {
            var td = document.createElement('td');
            td.innerHTML = cell;
            td.setAttribute('class', createID_Name(_data.columns[index]));
            tr.appendChild(td);
        });
        tbodyEl.appendChild(tr);
    });

    tableEl.appendChild(theadEl);
    tableEl.appendChild(tbodyEl);
    return tableEl;
}


function createRandomID(_prefix) {
    var prefix = _prefix || 'rndID_';
    var randomNumber = '' + Math.random();
    return prefix + randomNumber.replace('.', '');
}

function createID_Name(title) {
    return 'list_' + title.toLowerCase().replace(/[\W\s]/, '');
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
