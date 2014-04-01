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
        calcSwing();
        render();
    }

    /**
     * Calculate candidate votes based upon swing percentage to the BJP.
     * Modifies original data object.
     * @param  {int} _swing Swing percentage
     */
    function calcSwing(_swing) {
        var swingPercentage = _swing / 100;

        _.map(sourceData, function(cons) {
            // Check if BJP ran in this constituency
            var bjpCanidate = _.find(cons.candidates, function(can) {
                return can.party === 'BJP';
            });

            // Skip if BJP didn't run
            if (undefined === bjpCanidate) {
                // Store total swing votes
                 _.map(cons.candidates, function(can) {
                    can.swingVotesTotal = can.votes_secured.total;
                 });
                return;
            }

            // Calculate overall total votes for the constituency
            var totalVotes = _.reduce(cons.candidates, function(memo, d) {
                return memo + d.votes_secured.total;
            }, 0);

            // Calculate BJP swing vote count
            var bjpVotes = bjpCanidate.votes_secured.total;
            var swingVotes = bjpVotes * swingPercentage;

            // Store swing vote count and new BJP total votes
            bjpCanidate.swingVotes = swingVotes;
            bjpCanidate.swingVotesTotal = bjpVotes + swingVotes;

            // Total of remaining parties votes after removing BJP votes
            // (before addition of swing votes)
            var remainingVotes = totalVotes - bjpVotes;


            _.map(cons.candidates, function(can) {
                // Only precess non-BJP parties
                if ('BJP' === can.party) {
                    return;
                }

                // Calculate percentage share of other parties votes
                var perc = can.votes_secured.total / remainingVotes;

                // Subtract percentage of swing votes from candidate
                var totalVotes = can.votes_secured.total - (swingVotes * perc);

                // Store calculations
                can.percentageSwing = perc;
                can.swingVotesTotal = totalVotes;
            });

         });
    }

    /**
     * Calculate new party winners and marginality of constituencies.
     * @return {object} winners {
     *                              parties: {}         // Count of party wins
     *                              constituencies: []  // 5 most marginal
     *                           }
     */
    function calcSeats() {
        var winners = {
            parties: {},
            constituencies: []
        };

        var bjpWinningConstituencies = [];

        _.map(sourceData, function(constituency) {
            // Find the new winning part
            var winningParty = _.max(constituency.candidates, function(con) {
                    return con.swingVotesTotal;
                });

            // Increase party totals
            var partyName = winningParty.party;
            if (winners.parties.hasOwnProperty(partyName)) {
                winners.parties[partyName] += 1;
            } else  {
                winners.parties[partyName] = 1;
            }

            // NB: Sort is always ascending
            var sortedWinners = _.sortBy(constituency.candidates, function(con) {
                return con.swingVotesTotal;
            });
            // Reverse sorted array for largest first
            sortedWinners.reverse();

            // Check if constituency is a new BJP win
            if (partyName === 'BJP' && winningParty.position !== 1) {
                // Calculate marginality
                constituency.bjpMargin = sortedWinners[0].swingVotesTotal - sortedWinners[1].swingVotesTotal;
                bjpWinningConstituencies.push(constituency);
            }
        });

        // Store narrowest five marginality constituencies
        winners.constituencies = _.sortBy(bjpWinningConstituencies, function(con) {
            return con.bjpMargin;
        });
        winners.constituencies = winners.constituencies.slice(0, 5);

        return winners;
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
