var GI_INDIA = GI_INDIA || { tasks: [] };

/**
 * TASK: Find all constituencies where BJP 2nd to INC
 */
GI_INDIA.tasks.push(function bjp2inc() {
    var dataset = {
        title: 'BJP Second to INC',
        columns: ['state', 'constituency', 'AAP standing'],
        rows: [],
        constituencies: []
    };

    GI_INDIA.data.forEach(function( constituency ) {
        if ( constituency.candidates[0].party === 'INC' &&
             constituency.candidates[1].party === 'BJP')
        {
            dataset.rows.push([
                constituency.state,
                constituency.constituency,
                constituency.aap_standing
            ]);

            dataset.constituencies.push(constituency);
        }
    });

    return dataset;
});


/**
 * TASK: Find all constituencies were BJP is 1st or 2nd
 */
GI_INDIA.tasks.push(function bjpSeats() {
    var tableData = {
        title: 'BJP is 1st or 2nd',
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
        title: 'marginal seats',
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
        title: 'Safe seats',
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
    GI_INDIA.tasks.forEach(function(task, index) {
        GI_INDIA.outputDataSet(task(), index);
    });
};


GI_INDIA.Datasets = {
    el: document.querySelector('#data_set_nav'),

    store: [],

    addDataSet: function(_table, _dataset) {
        var dataset = {
            tableEl: _table,
            data: _dataset,
            titleEl: this.createTitle(_dataset.title)
        };

        dataset.titleEl.addEventListener('click', this.activateDataSet.bind(dataset));

        this.store.push(dataset);

        return dataset;
    },

    createTitle: function(title) {
        var el = document.createElement('div');
        el.classList.add('data-set-title');
        el.innerHTML = title;
        this.el.appendChild(el);
        return el;
    },

    activateDataSet: function() {
        // FIXME: better solution
        $('#data_set_table_wrapper table').hide();
        $(this.tableEl).show();
        $('#data_set_nav div').removeClass('active');
        $(this.titleEl).addClass('active');
        GI_INDIA.Map.addMarkers(this.data.constituencies);
    }
};

GI_INDIA.handleJSONSuccess = function(_data) {
    GI_INDIA.data = _data;
    GI_INDIA.processTasks();
};


GI_INDIA.outputDataSet = function(_dataset, taskIndex) {
    var dataset = GI_INDIA.Datasets.addDataSet(
        GI_INDIA.Tables.addTable(_dataset.columns, _dataset.rows),
        _dataset
    );


    if (taskIndex === 0) {
        GI_INDIA.Datasets.activateDataSet.call(dataset);
    }
};


/**
 * Create table
 */
GI_INDIA.Tables = {
    el: document.querySelector('#data_set_table_wrapper'),

    addTable: function(columns, rows) {
        var tableEl = this.createTable(columns, rows);
        this.el.appendChild(tableEl);
        return tableEl;
    },

    createTable: function(columns, rows) {
        var tableEl = document.createElement('table');
        var theadEl = document.createElement('thead');
        var tbodyEl = document.createElement('tbody');
        var trHeadEl = document.createElement('tr');

        tbodyEl.classList.add('list');
        theadEl.appendChild(trHeadEl);

        // Create head
        columns.forEach(function(col) {
            var th = document.createElement('th');
            th.innerHTML = col;
            th.classList.add('sort');
            th.setAttribute('data-sort', GI_INDIA.createID_Name(col));
            trHeadEl.appendChild(th);
        });

        // Create body
        rows.forEach(function(row) {
            var tr = document.createElement('tr');
            row.forEach(function(cell, index) {
                var td = document.createElement('td');
                td.innerHTML = cell;
                td.setAttribute('class', GI_INDIA.createID_Name(columns[index]));
                tr.appendChild(td);
            });
            tbodyEl.appendChild(tr);
        });

        tableEl.appendChild(theadEl);
        tableEl.appendChild(tbodyEl);
        return tableEl;
    }
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


GI_INDIA.Map = {
    el: document.querySelector('#data_set_map'),
    map: null,
    bounds: null,
    markers: [],

    setup: function() {
        var myLatlng = new google.maps.LatLng(21.0, 78.0);
        var mapOptions = {
            zoom: 3,
            center: myLatlng,
            disableDefaultUI: true
        };
        this.map = new google.maps.Map(this.el, mapOptions);
    },

    addSingleMarker: function(place) {
        if (place.lat === 'NA' || place.lng === 'NA') {
            return;
        }
        var latlng = new google.maps.LatLng(place.lat, place.lng);
        var marker = new google.maps.Marker({
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 3,
              fillColor: '#F00',
              fillOpacity: 0.5,
              strokeOpacity: 0.0
            },
          position: latlng,
          map: GI_INDIA.Map.map,
          title: place.title
        });

        GI_INDIA.Map.markers.push(marker);
        GI_INDIA.Map.bounds.extend(latlng);
    },

    clearMarkers: function() {
        this.markers.forEach(function(marker) {
            marker.setMap(null);
        });
        this.markers = [];
    },

    addMarkers: function(constituencies) {
        var places = constituencies.map(function(constituency) {
            return {
                lat: constituency.location.lat,
                lng: constituency.location.lng,
                title: constituency.constituency
            };
        });

        this.clearMarkers();
        this.bounds = new google.maps.LatLngBounds();
        places.forEach(this.addSingleMarker);
        this.map.fitBounds(this.bounds);
    }
};


GI_INDIA.DOM = {

    setup: function() {
        // GI_INDIA.$wrapper = $('#data_wrapper');
        // GI_INDIA.$nav = $('#data_set_nav');
        // GI_INDIA.$tableWrapper = $('#data_set_table_wrapper');
    }
};

GI_INDIA.init = function() {
    GI_INDIA.DOM.setup();
    GI_INDIA.Map.setup();

    var dataFile = 'processed_data.json';

    $.getJSON(dataFile)
        .done(GI_INDIA.handleJSONSuccess)
        .fail(GI_INDIA.handleJSONError);
};


GI_INDIA.init();
