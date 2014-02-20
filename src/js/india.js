var GI_INDIA = GI_INDIA || { tasks: [] };

/**
 * SAMPLE TASK:
 *     Process data and store in rows.
 *     eg. Out put first 5 candidates who's name begins with 'M'
 */
GI_INDIA.tasks.push(function TASK_NAME() {
    // Setup the table
    var tableData = {
        columns: ['Canidate name', 'Canidate party'],
        target: ('#example'),
        rows: []
    };


    var candidates = [];
    GI_INDIA.data.forEach(function( constituency ) {
        var mCandidates = constituency.candidates.filter(function(candidate) {
                return candidate.candidate_name[0].toLowerCase() === 'm';
            });

        if (mCandidates.length > 0) candidates = candidates.concat(mCandidates);
    });

    for (var i = 0; i < 5; i++) {
        tableData.rows.push( [
            candidates[i].candidate_name,
            candidates[i].party
        ]);
    }

    return tableData;
});


/**
 * TASK: Find all constituencies where BJP 2nd to INC
 */
GI_INDIA.tasks.push(function bjp2inc() {
    var tableData = {
        columns: ['state', 'constituency', 'AAP standing'],
        target: ('#bjp2inc'),
        rows: [],
        constituencies: []
    };

    GI_INDIA.data.forEach(function( constituency ) {
        if ( constituency.candidates[0].party === 'INC' &&
             constituency.candidates[1].party === 'BJP')
        {
            tableData.rows.push([
                constituency.state,
                constituency.constituency,
                constituency.aap_standing
            ]);

            tableData.constituencies.push(constituency);
        }
    });

    return tableData;
});


/**
 * TASK: Find all constituencies were BJP is 1st or 2nd
 */
GI_INDIA.tasks.push(function bjpSeats() {
    var tableData = {
        columns: ['state', 'constituency', 'position'],
        target: '#bjpSeats',
        rows: [],
        constituencies: []
    };

    GI_INDIA.data.forEach(function( constituency ) {
        constituency.candidates.forEach(function( candidate ) {
            if ( candidate.party === 'BJP' ) {
                if (candidate.position === 1 || candidate.position === 2) {
                    tableData.rows.push([
                        constituency.state,
                        constituency.constituency,
                        candidate.position
                    ]);

                    tableData.constituencies.push(constituency);
                }
            }
        });
    });

    return tableData;
});


/**
 * TASK: Find all the marginal seats.
 */
GI_INDIA.tasks.push(function marginalSeats() {
    var tableData = {
        columns: ['state', 'constituency', '1st party', '1st total', '2nd party', '2nd total', 'diff'],
        target: '#marginal',
        rows: [],
        constituencies: []
    };

    // Modifies original GI_INDIA.data!
    GI_INDIA.data.sort(function(a, b) {
        return (a.candidates[0].votes_secured.total - a.candidates[1].votes_secured.total) -
            (b.candidates[0].votes_secured.total - b.candidates[1].votes_secured.total);
    });


    for( var i = 0; i < 10; i++) {
        var diff = GI_INDIA.data[i].candidates[0].votes_secured.total - GI_INDIA.data[i].candidates[1].votes_secured.total;

        tableData.rows.push([
            GI_INDIA.data[i].state,
            GI_INDIA.data[i].constituency,
            GI_INDIA.data[i].candidates[0].party,
            GI_INDIA.data[i].candidates[0].votes_secured.total,
            GI_INDIA.data[i].candidates[1].party,
            GI_INDIA.data[i].candidates[1].votes_secured.total,
            diff
        ]);

        tableData.constituencies.push(GI_INDIA.data[i]);
    }

    return tableData;
});


/**
 * TASK: Find all the safe seats.
 */
GI_INDIA.tasks.push(function safeSeats() {
    var tableData = {
        columns: ['state', 'constituency', '1st party', '1st total', '2nd party', '2nd total', 'diff'],
        target: '#safeSeats',
        rows: [],
        constituencies: []
    };

    // Modifies original GI_INDIA.data!
    GI_INDIA.data.reverse();

    for( var i = 0; i < 10; i++) {
        var diff = GI_INDIA.data[i].candidates[0].votes_secured.total - GI_INDIA.data[i].candidates[1].votes_secured.total;
        tableData.rows.push([
            GI_INDIA.data[i].state,
            GI_INDIA.data[i].constituency,
            GI_INDIA.data[i].candidates[0].party,
            GI_INDIA.data[i].candidates[0].votes_secured.total,
            GI_INDIA.data[i].candidates[1].party,
            GI_INDIA.data[i].candidates[1].votes_secured.total,
            diff
        ]);

        tableData.constituencies.push(GI_INDIA.data[i]);
    }

    return tableData;
});








// INNER WORKINGS
GI_INDIA.processTasks = function() {
    GI_INDIA.tasks.forEach(function(task) {
        var tableData = task();
        GI_INDIA.appendTable(tableData, tableData.target);
    });
};


GI_INDIA.handleJSONSuccess = function(_data) {
    GI_INDIA.data = _data;
    GI_INDIA.processTasks();
};


GI_INDIA.appendTable = function(_data, _target, _id) {
    var target = (_target) ? document.querySelector(_target) : document.body;
    var tableEl = GI_INDIA.createTableEl(_data, _data.rows.length);
    var id = _id || GI_INDIA.createRandomID('table_');

    GI_INDIA.addMap(target, _data);

    var wrapperEl = document.createElement('div');
    wrapperEl.setAttribute('id', id);
    wrapperEl.appendChild(tableEl);
    target.appendChild(wrapperEl);

    var valNames = _data.columns.map(function(col) {
        return GI_INDIA.createID_Name(col);
    });

    if (!GI_INDIA.hasOwnProperty('tables')) GI_INDIA.tables = [];

    GI_INDIA.tables.push( new List(id, { valueNames: valNames }) );


};


/**
 * Create table
 */
GI_INDIA.createTableEl = function(_data, _rowCount) {
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
        th.setAttribute('data-sort', GI_INDIA.createID_Name(col));
        trHeadEl.appendChild(th);
    });

    // Create body
    _data.rows.forEach(function(row) {
        var tr = document.createElement('tr');
        row.forEach(function(cell, index) {
            var td = document.createElement('td');
            td.innerHTML = cell;
            td.setAttribute('class', GI_INDIA.createID_Name(_data.columns[index]));
            tr.appendChild(td);
        });
        tbodyEl.appendChild(tr);
    });

    tableEl.appendChild(theadEl);
    tableEl.appendChild(tbodyEl);
    return tableEl;
};


GI_INDIA.createRandomID = function(_prefix) {
    var prefix = _prefix || 'rndID_';
    var randomNumber = '' + Math.random();
    return prefix + randomNumber.replace('.', '');
};


GI_INDIA.createID_Name = function(title) {
    return 'list_' + title.toLowerCase().replace(/[\W\s]/, '');
};


GI_INDIA.outputData = function(data) {
    outputContainer.innerHTML += JSON.stringify(data) + '\n';
};


GI_INDIA.handleJSONError = function() {
    console.error('Problem fetching JSON');
};


GI_INDIA.addMap = function(target, _data) {

    var mapDOM = document.createElement('div');
    mapDOM.setAttribute('id', GI_INDIA.createRandomID('map_'));
    mapDOM.setAttribute('style', 'width: 500px; height: 240px;');
    target.appendChild(mapDOM);

    initialize();

    function initialize() {
      var myLatlng = new google.maps.LatLng(21.0, 78.0);
      var mapOptions = {
        zoom: 3,
        center: myLatlng,
        disableDefaultUI: true
      };
      var map = new google.maps.Map(mapDOM, mapOptions);

      if (_data.constituencies) {
          _data.constituencies.forEach(function(constituency) {
            var latlng = new google.maps.LatLng(constituency.location.lat, constituency.location.lng);
            var marker = new google.maps.Marker({
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 3,
                      fillColor: '#F00',
                      fillOpacity: 0.5,
                      strokeOpacity: 0.0
                    },
                  position: latlng,
                  map: map,
                  title: constituency.constituency
              });
          });
      }
    }

};

GI_INDIA.init = function() {
    var dataFile = 'processed_data.json';

    $.getJSON(dataFile)
        .done(GI_INDIA.handleJSONSuccess)
        .fail(GI_INDIA.handleJSONError);
};


GI_INDIA.init();
