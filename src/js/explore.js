// India stats
var INDIA = (function() {
    var originalSeatsTotals = {};
    var sourceData;
    var $sliderEl;

    function render() {
    }

    /**
     * Calculate new party count based in swing percentage.
     * @param  {int} _swingVal Percentage swing
     */
    function updateSwing(_swingVal) {
        //console.log
    }


    function handleJSONError(error) {
        console.error('Failed loading data: ' + error.toString());
    }

    function populateData(data) {
        sourceData = data;
        calcSwing(2);
        console.log(sourceData[0]);
        render();
    }

    function calcSwing(_swing) {
        var swingPercentage = _swing / 100;
        var partyResults = {};

        _.map(sourceData, function(cons) {
            // Check if BJP ran in this constituency
            var bjpCanidate = _.find(cons.candidates, function(can) {
                return can.party === 'BJP';
            });

            // Skip if BJP didn't run
            if (undefined === bjpCanidate) {
                return;
            }

            var totalVotes = _.reduce(cons.candidates, function(memo, d) {
                return memo + d.votes_secured.total;
            }, 0);

            var bjpVotes = bjpCanidate.votes_secured.total;
            var swingVotes = bjpVotes * swingPercentage;
            bjpCanidate.swingVotesTotal = swingVotes;

            var remainingVotes = totalVotes - bjpVotes;

            _.map(cons.candidates, function(can) {
                if ('BJP' === can.party) {
                    return;
                }
                var perc = can.votes_secured.total / remainingVotes;
                var totalVotes = can.votes_secured.total - (swingVotes * perc);
                can.swingVotesTotal = totalVotes;
            });

            _.map(cons.candidates, function(can) {

            });

         });
    }

    function getPartyTotal(partyCode) {
        return _.reduce(sourceData, function(memo, constituency) {
            var winner = constituency.candidates[0].party;
            return (winner === partyCode) ? memo + 1 : memo;
        }, 0);
    }

    function fetchData() {
        var dataFile = 'processed_data.json';
        $.getJSON(dataFile)
            .done(populateData)
            .fail(handleJSONError);
    }

    function handleRangeChange() {
        updateSwing(parseInt($sliderEl, 10));
    }

    function setupDOM() {
        $sliderEl.on('change', handleRangeChange, false);
    }

    function init() {
        fetchData();
    }

    return { init: init };
}());


INDIA.init();

