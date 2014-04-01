


var width = 250;
var height = 200;

var data = [
    { "x_axis": 30, "y_axis": 30, "radius": 3, "color" : "green" },
    { "x_axis": 30, "y_axis": 30, "radius": 3, "color" : "green" }
];

var svgContainer = d3.select("#d3Chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr('shape-rendering', 'crispEdges');


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
 * TASK: BJP 2nd, ordered: marginality.
 */
GI_INDIA.tasks.push(function bjpSecond() {
    var tableData = {
        title: 'BJP Second',
        columns: ['state', 'constituency', 'Vote margin %', '1st party', '1st total %', '2nd party', '2nd total %', 'AAP standing'],
        target: '#marginal',
        rows: [],
        constituencies: [],
        markers: []
    };

    var results = _.filter(GI_INDIA.data, function(con) {
        return _.findWhere(con.candidates, {position: 2, party: 'BJP'});
    });

    var sorted = _.sortBy(results, function(item) {
        var second = _.findWhere(item.candidates, {position: 2, party: 'BJP'});
        var first = _.findWhere(item.candidates, {position: 1});
        return first.percent_votes_secured.over_total_votes_polled_in_constituency - second.percent_votes_secured.over_total_votes_polled_in_constituency;
    });

    _.each(sorted, function (con) {
        var second = _.findWhere(con.candidates, {position: 2, party: 'BJP'});
        var first = _.findWhere(con.candidates, {position: 1});

        tableData.rows.push([
            con.state,
            con.constituency,
            parseFloat((first.percent_votes_secured.over_total_votes_polled_in_constituency - second.percent_votes_secured.over_total_votes_polled_in_constituency).toFixed(2)),
            first.party,
            first.percent_votes_secured.over_total_votes_polled_in_constituency,
            second.party,
            second.percent_votes_secured.over_total_votes_polled_in_constituency,
            con.aap_standing
        ]);


        tableData.markers.push({
            lat: con.location.lat,
            lng: con.location.lng,
            title: con.constituency,
            opacity: 0
        });

        tableData.constituencies.push(con);
    });

    var minMargin = _.min(tableData.rows, function(item) { return item[2]; })[2];
    var maxMargin = _.max(tableData.rows, function(item) { return item[2]; })[2];

    _.each(tableData.markers, function(marker, index) {
        var marginPercent = tableData.rows[index][2];
        var OldRange = (maxMargin - minMargin);
        var NewRange = (1 - 0);
        var NewValue = (((marginPercent - minMargin) * NewRange) / OldRange) + 0;

        marker.opacity = NewValue;
    });




    return tableData;
});

/**
 * TASK: BJP 2nd, ordered: marginality.
 */
GI_INDIA.tasks.push(function bjpThird() {
    // "percent_votes_secured": {
    //       "over_total_electors_in_constituency": 22.74,
    //       "over_total_votes_polled_in_constituency": 29.78
    //     },
    var tableData = {
        title: 'BJP Third',
        columns: [
            'state',
            'constituency',
            'Vote margin % 1st / 3rd',
            '1st party',
            '1st % total polled votes',
            '2nd party',
            '2nd % total polled votes',
            '3rd party',
            '3rd % total polled votes',
            'AAP standing'
        ],
        target: '#marginal',
        rows: [],
        constituencies: [],
        markers: []
    };

    var results = _.filter(GI_INDIA.data, function(con) {
        return _.findWhere(con.candidates, {position: 3, party: 'BJP'});
    });

    var sorted = _.sortBy(results, function(item) {

        // "percent_votes_secured": {
        //   "over_total_electors_in_constituency": 9.98,
        //   "over_total_votes_polled_in_constituency": 13.08
        // }
        //
        var first = _.findWhere(item.candidates, {position: 1});
        var third = _.findWhere(item.candidates, {position: 3, party: 'BJP'});
        return first.percent_votes_secured.over_total_votes_polled_in_constituency - third.percent_votes_secured.over_total_votes_polled_in_constituency;
    });

    _.each(sorted, function (con) {
        var first = _.findWhere(con.candidates, {position: 1});
        var second = _.findWhere(con.candidates, {position: 2});
        var third = _.findWhere(con.candidates, {position: 3, party: 'BJP'});

        tableData.rows.push([
            con.state,
            con.constituency,
            parseFloat((first.percent_votes_secured.over_total_votes_polled_in_constituency - third.percent_votes_secured.over_total_votes_polled_in_constituency).toFixed(2)),
            first.party,
            first.percent_votes_secured.over_total_votes_polled_in_constituency,
            second.party,
            second.percent_votes_secured.over_total_votes_polled_in_constituency,
            third.party,
            third.percent_votes_secured.over_total_votes_polled_in_constituency,
            con.aap_standing
        ]);

         tableData.markers.push({
            lat: con.location.lat,
            lng: con.location.lng,
            title: con.constituency,
            opacity: 0
        });

        tableData.constituencies.push(con);
    });


    var minMargin = _.min(tableData.rows, function(item) { return item[2]; })[2];
    var maxMargin = _.max(tableData.rows, function(item) { return item[2]; })[2];


    _.each(tableData.markers, function(marker, index) {
        var marginPercent = tableData.rows[index][2];
        var OldRange = (maxMargin - minMargin);
        var NewRange = (1 - 0);
        var NewValue = (((marginPercent - minMargin) * NewRange) / OldRange) + 0;

        marker.opacity = NewValue;
    });


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
        constituencies: [],
        markers: []
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
        $('#data_set_table_wrapper .table_wrapper').hide();
        $(this.tableEl).show();
        $('#data_set_nav div').removeClass('active');
        $(this.titleEl).addClass('active');

        // DEBUG!
        if (this.data.markers) {
            //GI_INDIA.Map.TESTING(this.data.markers);
        } else {
            //GI_INDIA.Map.addMarkers(this.data.constituencies);
        }
    }
};

GI_INDIA.handleJSONSuccess = function(_data) {
    GI_INDIA.data = _data;

    var congressConstituencies = _.filter(GI_INDIA.data, function(constituency) {
        var didBJPRun = _.some(constituency.candidates, function(candidate) {
            return candidate.party === 'BJP';
        });

        return (constituency.candidates[0].party === 'INC' && didBJPRun);
    });


    var marginalityList = congressConstituencies.map(function(constituency) {
        var inc = _.find(constituency.candidates, function(c) { return c.party === 'INC';} );
        var bjp = _.find(constituency.candidates, function(c) { return c.party === 'BJP';} );

        var marginality = inc.votes_secured.total - bjp.votes_secured.total;
        var totalVotes = _.reduce(constituency.candidates, function(memo, num) {
            return memo + num.votes_secured.total;
        }, 0);

        return {
            marginality: marginality,
            totalVotes: totalVotes,
            constituency: constituency.constituency
        };
    });

    var marginalityDomainValues = _.map(marginalityList, function(m) {
        return m.marginality;
    });



    var yScale = d3.scale.linear()
                    .domain([_.max(marginalityDomainValues), _.max(marginalityDomainValues) * -1])
                    .range([0, 200]);

    console.log(yScale(0));
    console.log(yScale(100000));
    console.log(yScale(-100000))
    // var lineFunction = d3.svg.line()
    //     .x(function (d, index) { return yScale(d.marginality); })
    //     .y(function (d, index) { return 2 * index; })
    //     .interpolate("linear");

    // var lineGraph = svgContainer.append("path")
    //     .attr("d", lineFunction(marginalityList))
    //     .attr("stroke", "blue")
    //     .attr("fill", "none");
    //
    //


    var lines = svgContainer.selectAll("line")
        .data(marginalityList)
        .enter()
        .append("line");

    lines
        .attr("x1", 100)
        .attr("y1", function (d, index) { return index; })
        .attr("x2", function (d) { return Math.floor(yScale(d.marginality)); })
        .attr("y2", function (d, index) { return index; })
        .style("stroke", function(d) { return (d.marginality > 0) ? 'rgba(0, 224, 255, 0.2)' : 'rgba(255, 133, 0, 0.2)'; })
        .style("stroke-width", '1px');

    var rectagles = svgContainer.selectAll("rect2")
        .data(marginalityList)
        .enter()
        .append("rect");

    rectagles
        .attr("x", function (d, index) { return Math.floor(yScale(d.marginality)); })
        .attr("y", function (d, index) { return index - 0.5; })
        .attr("width", "1")
        .attr("height", "1")
        .style("fill", function(d) { return (d.marginality > 0) ? 'rgb(0, 224, 255)' : 'rgb(255, 133, 0)'; });



    var sliderEl = document.querySelector('#slider');
    sliderEl.setAttribute('max', _.max(marginalityDomainValues));
    sliderEl.setAttribute('min', 0);
    sliderEl.addEventListener('change', sliderChanged, false);

    var incTotalCount = _.reduce(GI_INDIA.data, function(counter, constituency) {
        var num = (constituency.candidates[0].party === 'INC' &&
                   constituency.candidates[0].position === 1);
        return counter + num;
    }, 0);

    var bjpTotalCount = _.reduce(GI_INDIA.data, function(counter, constituency) {
        var num = (constituency.candidates[0].party === 'BJP' &&
                   constituency.candidates[0].position === 1);
        return counter + num;
    }, 0);

    // DOM
    var incVoteEl = document.querySelector('#inc_vote_count');
    var incVoteTotalEl = document.querySelector('#inc_vote_count_total');
    var bjpVoteEl = document.querySelector('#bjp_vote_count');
    var bjpVoteTotalEl = document.querySelector('#bjp_vote_count_total');



    function sliderChanged(event) {
        var data = _.map(marginalityList, function(m) {
            return {
                marginality: m.marginality - this.value
            };
        }, this);

        var bjpSeatCount = _.reduce(data, function(counter, d) {
            var num = (d.marginality > 0) ? 0 : 1;
            return counter + num;
        }, 0);

        var incSeatCount = data.length - bjpSeatCount;

        bjpVoteEl.innerHTML = bjpSeatCount;
        incVoteEl.innerHTML = incSeatCount;

        bjpVoteTotalEl.innerHTML = bjpTotalCount + bjpSeatCount;
        incVoteTotalEl.innerHTML = incTotalCount - bjpSeatCount;


        rectagles
            .data(data)
            .style("fill", function(d) { return (d.marginality > 0) ? 'rgb(0, 224, 255)' : 'rgb(255, 133, 0)'; })
            .transition()
            .attr("x", function (d, index) { return Math.floor(yScale(d.marginality)); });

        lines
            .data(data)
            .style("stroke", function(d) { return (d.marginality > 0) ? 'rgba(0, 224, 255, 0.2)' : 'rgba(255, 133, 0, 0.2)'; })
            .transition()
            .attr("x2", function (d) { return Math.floor(yScale(d.marginality)); });

    }


    GI_INDIA.processTasks();
};


GI_INDIA.outputDataSet = function(_dataset, taskIndex) {
    var dataset = GI_INDIA.Datasets.addDataSet(
        GI_INDIA.Tables.addTable(_dataset.columns, _dataset.rows),
        _dataset
    );

    // FIXME: Better way of getting ID.
    $('table', dataset.tableEl).tablesorter();
    $('table', dataset.tableEl).bind('sortEnd',function(e, table) {
        if ($(table).hasClass('collapsed')) {
            $('tr', table).removeClass('hidden');
            $('tr:nth-child(n+6)', table).addClass('hidden');
        }
    });

    if (taskIndex === 0) {
        GI_INDIA.Datasets.activateDataSet.call(dataset);
    } else {
        $(dataset.tableEl).hide();
    }
};


/**
 * Create table
 */
GI_INDIA.Tables = {
    el: document.querySelector('#data_set_table_wrapper'),

    addTable: function(columns, rows) {
        var wrapperEl = document.createElement('div');
        var tableEl = this.createTable(columns, rows);
        var toggleEl = this.createToggle(tableEl);

        wrapperEl.classList.add('table_wrapper');
        wrapperEl.setAttribute('id', GI_INDIA.createRandomID('table_'));
        wrapperEl.appendChild(tableEl);
        wrapperEl.appendChild(toggleEl);
        this.el.appendChild(wrapperEl);

        this.toggleCollapse.call(tableEl);

        return wrapperEl;
    },

    toggleCollapse: function() {
        // FIXME: Clean up toggling
        // var rows = this.querySelectorAll('tr:nth-child(n+6)');
        // for (var i = 0; i < rows.length; i++) {
        //     rows[i].classList.toggle('hidden');
        // }
        //
        this.classList.toggle('collapsed');
        if (this.classList.contains('collapsed')) {
            $('tr:nth-child(n+6)', this).addClass('hidden');
        } else {
            $('tr:nth-child(n+6)', this).removeClass('hidden');
        }
    },

    createToggle: function(tableEl) {
        var collapseEl = document.createElement('div');
        collapseEl.classList.add('table_toggle');
        collapseEl.innerHTML = 'Show full table data';
        collapseEl.addEventListener('click', this.toggleCollapse.bind(tableEl));
        return collapseEl;
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
        rows.forEach(function(row, rowIndex) {
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
    style: [
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          { "visibility": "off" }
        ]
      },{
        "featureType": "road",
        "stylers": [
          { "visibility": "off" }
        ]
      },{
        "featureType": "administrative",
        "stylers": [
          { "visibility": "off" }
        ]
      },{
        "featureType": "landscape",
        "stylers": [
          { "saturation": -100 },
          { "gamma": 1 },
          { "lightness": 60 }
        ]
      },{
        "featureType": "water",
        "stylers": [
          { "saturation": -100 },
          { "gamma": 9.99 },
          { "lightness": 100 }
        ]
      },{
      },{
        "featureType": "poi",
        "stylers": [
          { "visibility": "off" }
        ]
      },{
      }
    ],

    setup: function() {
        var styledMap = new google.maps.StyledMapType(this.style, {name: "Styled Map"});
        var myLatlng = new google.maps.LatLng(21.0, 78.0);
        var mapOptions = {
            zoom: 3,
            center: myLatlng,
            disableDefaultUI: true
        };
        this.map = new google.maps.Map(this.el, mapOptions);
        this.map.mapTypes.set('map_style', styledMap);
        this.map.setMapTypeId('map_style');
    },

    addSingleMarker: function(place) {
        if (place.lat === 'NA' || place.lng === 'NA') {
            return;
        }

        var latlng = new google.maps.LatLng(place.lat, place.lng);
        var marker = new google.maps.Marker({
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 2,
              fillColor: place.color || '#F00',
              fillOpacity: place.opacity || 0.5,
              strokeOpacity: place.strokeopacity || 0.0,
              strokeColor: '#F00',
              strokeWidth: 2
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
                title: constituency.constituency,
                strokeopacity: 1
            };
        });

        var allPlaces = GI_INDIA.data.map(function(constituency) {
            var doit = _.find(places, function(c) { return c.constituency === constituency.constituency; });

            if (doit) return;

            return {
                lat: constituency.location.lat,
                lng: constituency.location.lng,
                title: constituency.constituency,
                color: '#CCC'
            };
        });

        this.clearMarkers();
        this.bounds = new google.maps.LatLngBounds();
        allPlaces.forEach(this.addSingleMarker);
        places.forEach(this.addSingleMarker);
        this.map.fitBounds(this.bounds);
    },

    TESTING: function(markers) {
        this.clearMarkers();
        this.bounds = new google.maps.LatLngBounds();
        markers.forEach(this.addSingleMarker);
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
    //GI_INDIA.Map.setup();

    var dataFile = 'processed_data.json';

    $.getJSON(dataFile)
        .done(GI_INDIA.handleJSONSuccess)
        .fail(GI_INDIA.handleJSONError);
};


GI_INDIA.init();
