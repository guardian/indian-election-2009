// India stats
var INDIA = (function() {
    var originalSeatsTotals = {};
    var sourceData;
    var $slider;
    var SLIDER_DELAY = 300;
    var swingAmount;
    var tabelTemplate;
    var seatTemplate;
    var takenTemplate;
    var $seats;
    var $table;
    var $takenSeats;
    var $swingPercent;
    var $bjpCount;
    var $incCount;
    var outputData;
    var chart;

    function render() {
        $swingPercent.html(swingAmount + '%');
        $bjpCount.html(outputData.parties.BJP);
        $incCount.html(outputData.parties.INC);
        renderTable();
        renderPartyChart();
        console.log(outputData);
    }

    /**
     * Calculate new party count based in swing percentage.
     * @param  {int} _swingVal Percentage swing
     */
    function updateSwing(_swingVal) {
        if (swingAmount === _swingVal) {
            return;
        }
        swingAmount = _swingVal;
        calcSwing();
        outputData = calcSeats();
        render();
    }


    function handleJSONError(error) {
        console.error('Failed loading data: ' + error.toString());
    }

    function populateData(_data) {

        var p = [];
        var list = '';
        _.map(_data, function(con) {
            _.map(con.candidates, function(can) {
                if (p.indexOf(can.party) === -1) {
                    p.push(can.party);
                    list += can.party + '\n';
                }
            });
        });

        window.list = list;

        sourceData = _data;
        handleRangeChange();
    }

    /**
     * Calculate candidate votes based upon swing percentage to the BJP.
     * Modifies original data object.
     */
    function calcSwing() {
        var swingPercentage = swingAmount / 100;

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
            var swingVotes = totalVotes * swingPercentage;
            var swingVotesTotal = bjpVotes + swingVotes;

            // Store swing vote count and new BJP total votes
            bjpCanidate.swingVotes = swingVotes;
            bjpCanidate.swingVotesTotal = swingVotesTotal;
            cons.bjpMajority = (swingVotesTotal / totalVotes) * 100;
            cons.totalVotes = totalVotes;

            // Total of remaining parties votes after removing BJP votes
            // (before addition of swing votes)
            var remainingVotes = totalVotes - swingVotesTotal;

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
            takenSeats: {},
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

                var loserParty = constituency.candidates[0];
                if (winners.takenSeats.hasOwnProperty(loserParty.party)) {
                    winners.takenSeats[loserParty.party] += 1;
                } else {
                    winners.takenSeats[loserParty.party] = 1;
                }


                // Calculate marginality
                constituency.bjpMargin = sortedWinners[0].swingVotesTotal - sortedWinners[1].swingVotesTotal;
                constituency.swingPositions = [
                    sortedWinners[0],
                    sortedWinners[1]
                ];

                var gapPercentage = (constituency.bjpMargin / constituency.totalVotes) * 100;
                console.log(gapPercentage, constituency.bjpMargin, constituency.totalVotes);
                constituency.gapPercentage = gapPercentage;
                bjpWinningConstituencies.push(constituency);
            }
        });

        // Store narrowest five marginality constituencies
        winners.constituencies = _.sortBy(bjpWinningConstituencies, function(con) {
            return con.gapPercentage;
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
        updateSwing(parseInt($slider.val(), 10));
    }

    function setupDOM() {
        $table = $('#table_container');
        $seats = $('#seat_container');
        $swingPercent = $('#swingPercent');
        $takenSeats = $('#taken_container');
        $incCount = $('#incCount');
        $bjpCount = $('#bjpCount');
        $slider = $('#slider');
        $slider.get()[0].addEventListener(
            'change',
            _.debounce(handleRangeChange, SLIDER_DELAY),
            false
        );

        tabelTemplate = $('#table_template').html();
        seatTemplate = $('#seat_template').html();
        takenTemplate = $('#taken_template').html();
    }

    function renderTable() {
        var cons = _.map(outputData.constituencies, function(constituency) {
            var margin = constituency.candidates[0].percent_votes_secured.over_total_votes_polled_in_constituency -
            constituency.candidates[1].percent_votes_secured.over_total_votes_polled_in_constituency;

            return {
                state: constituency.state,
                constituency: toTitleCase(constituency.constituency),
                party: partyNames[constituency.candidates[0].party],
                majority: margin.toFixed(2),
                bjpMajority: constituency.gapPercentage.toFixed(2)
            };
        });

        var templateData = {
            constituencies: cons
        };

        $table.html(_.template(tabelTemplate, templateData));
    }

    function renderPartyChart(){
        var width;
        var screenWidth = $(window).width();
        if (screenWidth >= 480 && screenWidth < 620) {
            width = screenWidth - 180;
        } else if (screenWidth >= 620){
            width = 620 - 180;
        } else{
            width = screenWidth -20;
        }


        var data = [];
        var otherParties = {
            'partyCode': 'OTHERS',
            'party' : 'Other parties',
            'seats' : 0,
            'Alliance' : ''
        };

        var bjpParty;

        _.map(outputData.parties, function(i, partyCode, parties) {
            if (parties[partyCode] < 10) {
                otherParties.seats += 1;
                return;
            }

            var result = {
                'partyCode': partyCode,
                'party' : partyNames[partyCode],
                'seats' : parties[partyCode],
                'Alliance' : ''
            };

            if (partyCode === 'BJP') {
                bjpParty = result;
            } else {
                data.push(result);
            }
        });

        data.push(otherParties);
        data.push(bjpParty);

        var height = width / 2;
        var padding = 10;
        var radius = height;

        var colors = {
            'INC'   : 'rgb(75, 198, 223)',
            'BJP'   : 'rgb(255, 187, 0)',
            'CPM'   : 'rgb(255, 0, 0)',
            'BSP'   : 'rgb(0, 0, 255)',
            'SHS'   : 'rgb(255, 165, 0)',
            'BJD'   : 'rgb(0, 66, 37)',
            'DMK'   : 'rgb(0, 0, 0)',
            'SP'    : 'rgb(255, 0, 0)',
            'AITC'  : 'rgb(102, 255, 0)',
            'JD(U)' : 'rgb(0, 128, 0)',
            'OTHERS': 'rgb(150, 150, 150)'
        };

        var $tooltip;
        var degree = Math.PI/180; // just to convert the radian-numbers

        //$tooltip = $('.tooltip');
        var partyChartWrapper = d3.select('.pie-chart')
            .style({
                "width" : width + "px"
            })
            .select('.pies')
            .style({
                "height" : height + 20 + "px",
                "width" : width + "px"
            })
            .append('div')
            .attr('class','parties')
            .append('svg')
            .data([data])
            .attr("height", height +20)
            .attr("width", width)
            .append('g')
            .attr("transform","translate(" + radius + "," + radius + ")");


        var arc = d3.svg.arc()
            .outerRadius(radius);

        var pie = d3.layout.pie()
            .value(function(d) {
                return d.seats;
            })
            .sort(null)
            .startAngle(-90 * degree).endAngle(90 * degree);

        var arcs = partyChartWrapper.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
            .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
            .enter()
            .append('g')
            .attr('class','slice');
            // .on("mouseover", function(d){
            //     $tooltip.html("<p class='tooltipAlliance'><span class='allianceColor' style='color:"+colors[d.data.Alliance]+";'>" +d.data.Alliance+"</span></p><p class='tooltipParty'>" + d.data.Party + "</p><p class='tooltipSeats'> "+d.data.Seats+" seats</p>")
            //     $tooltip.css("border-color",colors[d.data.Alliance]);

            // })
            // .on("mouseleave", function(d){
            //     $tooltip.html("<p class='tooltipStatus'>Hover over a party to see more information</p>")
            //     $tooltip.css("border-color",colors[d.data.Alliance]);
            //     $tooltip.css("border-color","#333");
            // });


        arcs.append("path")
            .attr("fill", function(d, i) { return colors[d.data.partyCode]; } )
            .attr("d", arc);
    }

    function toTitleCase(str) {
        return str.replace(/\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    function init() {
        setupDOM();
        fetchData();
    }

    return { init: init };
}());


$(document).ready(INDIA.init);



var partyNames = {
    "BJP": "Bharatiya Janata Party",
    "BSP": "Bahujan Samaj Party",
    "CPI": "Communist Party of India",
    "CPM": "Communist Party of India (Marxist)",
    "INC": "Indian National Congress",
    "NCP": "Nationalist Congress Party",
    "RJD": "Rashtriya Janata Dal",
    "AC": "Arunachal Congress",
    "ADMK": "All India Anna Dravida Munnetra Kazhagam",
    "AGP": "Asom Gana Parishad",
    "AIFB": "All India Forward Bloc",
    "AITC": "All India Trinamool Congress",
    "AUDF": "Assam United Democratic Front",
    "BJD": "Biju Janata Dal",
    "DMK": "Dravida Munnetra Kazhagam",
    "INLD": "Indian National Lok Dal",
    "JD(S)": "Janata Dal (Secular)",
    "JD(U)": "Janata Dal (United)",
    "JKN": "Jammu & Kashmir National Conference",
    "JKNPP": "Jammu & Kashmir National Panthers Party",
    "JKPDP": "Jammu & Kashmir Peoples Democratic Party",
    "JMM": "Jharkhand Mukti Morcha",
    "KEC": "Kerala Congress",
    "KEC(M)": "Kerala Congress (M)",
    "LJP": "Lok Jan Shakti Party",
    "MAG": "Maharashtrawadi Gomantak",
    "MDMK": "Marumalarchi Dravida Munnetra Kazhagam",
    "MPP": "Manipur Peoples Party",
    "MUL": "Muslim League Kerala State Committee",
    "NPF": "Nagaland Peoples Front",
    "PMK": "Pattali Makkal Katchi",
    "RSP": "Revolutionary Socialist Party",
    "SAD": "Shiromani Akali Dal",
    "SDF": "Sikkim Democratic Front",
    "SGF": "Save Goa Front",
    "SHS": "Shivsena",
    "SP": "Samajwadi Party",
    "TDP": "Telugu Desam",
    "TRS": "Telangana Rashtra Samithi",
    "UDP": "United Democratic Party",
    "UKKD": "Uttarakhand Kranti Dal",
    "ABAS": "Akhil Bharatiya Ashok Sena",
    "ABCD(A)": "Akhil Bharatiya Congress Dal (Ambedkar)",
    "ABDBM": "Akhil Bharatiya Desh Bhakt Morcha",
    "ABHKP": "Akhil Bharatiya Hind Kranti Party",
    "ABHM": "Akhil Bharat Hindu Mahasabha",
    "ABJP": "All India Bharti Jug Party",
    "ABJS": "Akhil Bharatiya Jan Sangh",
    "ABKMM": "Akhil Bharatiya Kisan Mazdoor Morcha",
    "ABLTP": "Akhil Bharatiya Loktantra Party",
    "ABMP": "Akhil Bhartiya Manavata Paksha",
    "ABMSD": "Akhil Bharatiya Manav Seva Dal",
    "ABMSKP": "Akahand Bharat Maha Sangh Sarvahara Krantikari Party",
    "ABP": "Ambedkarbadi Party",
    "ABRS": "Akhil Bharatiya Rajarya Sabha",
    "ABSR": "Akhil Bharatiya Shivsena Rashtrawadi",
    "ABSSP": "Akhil Bhartiya Sindhu Samajwadi Party",
    "ACNC": "A-Chik National Congress(Democratic)",
    "AD": "Apna Dal",
    "ADSMK": "Anaithindia Dravidar Samudaya Munnetra Kazhagam",
    "ADSP": "Aadivasi Sena Party",
    "AIBS": "All India Bahujan Samman Party",
    "AIC": "Advait Ishwasyam Congress",
    "AIDWC": "All India Dalit Welfare Congress",
    "AIFB(S)": "All India Forward Bloc (Subhasist)",
    "AIJMK": "Akhila India Jananayaka Makkal Katchi (Dr. Issac)",
    "AIMF": "All India Minorities Front",
    "AIMIM": "All India Majlis-E-Ittehadul Muslimeen",
    "AIRP": "All India Raksha Party",
    "AIVP": "Akila India Vallalar Peravai",
    "AJBP": "Ajeya Bharat Party",
    "AJSP": "Alpjan Samaj Party",
    "AJSUP": "AJSU Party",
    "AMB": "Amra Bangalee",
    "ANC": "Ambedkar National Congress",
    "AP": "Awami Party",
    "APRD": "Ambedkar Pragatisheel Republican Dal",
    "ARP": "Ambedkarist Republican Party",
    "ARWP": "Akhil Rashtrawadi Party",
    "ASDC": "Autonomous State Demand Committee",
    "ASP": "Ambedkar Samaj Party",
    "AWD": "Adarshwadi Dal",
    "BAP": "Bundelkhand Akikrit Party",
    "BBM": "Bharipa Bahujan Mahasangha",
    "BBP": "Bharatiya Backward Party",
    "BCDP": "Backward Classes Democratic Party, J&K",
    "BCP": "Bhartiya Chaitanya Party",
    "BCUF": "B. C. United Front",
    "BD": "Bharat Dal",
    "BDBP": "Bhartiya Deshbhakt Party",
    "BEP": "Bharatiya Eklavya Party",
    "BGD": "Bharatiya Grameen Dal",
    "BGTD": "Bharatiya Gaon Taj Dal",
    "BHBP": "Bharatiya Bahujan Party",
    "BHC": "Bhartiya Congress (M)",
    "BHJAP": "Bhartiya Jagran Party",
    "BHPD": "Bharatiya Pichhra Dal",
    "BHPP": "Bharatiya Peoples Party",
    "BHSASP": "Bharatheeya Sadharma Samsthapana Party",
    "BJBCD": "Bharatiya Jan Berojgar Chhatra Dal",
    "BJBP": "Bharatiya Jai Bheem Party",
    "BJJD": "Bharatiya Jantantrik Janta Dal",
    "BJKD": "Bharatiya Jan Kranti Dal (Democratic)",
    "BJKVP": "Bajjikanchal Vikas Party",
    "BJSH": "Bharatiya Jan Shakti",
    "BJTP": "Bharatiya Jantantrik Parishad",
    "BKLJP": "Bharat Ki Lok Jimmedar Party",
    "BLKD": "Bharatiya Lok Kalyan Dal",
    "BLPGL": "Bharatiya Loktantrik Party(Gandhi-Lohiawadi)",
    "BMF": "Bharatiya Momin Front",
    "BMM": "Bundelkhand Mukti Morcha",
    "BMSM": "Bharatiya Minorities Suraksha Mahasangh",
    "BNJD": "Bharatiya Natiional Janta Dal",
    "BNRP": "Bharatiya Nagrik Party",
    "BOP": "Bira Oriya Party",
    "BOPF": "Bodaland Peoples Front",
    "BPC": "Bhartiya Pragatisheel Congress",
    "BPD": "Bharat Punarnirman Dal",
    "BPJP": "Bharatiya Praja Paksha",
    "BREM": "Bahujan Republican Ekta Manch",
    "BRM": "Bharatiya Rashtriya Morcha",
    "BRP": "Bharatiya Rashtravadi Paksha",
    "BRPP": "Bharatiya Republican Paksha",
    "BSA": "Bahujan Shakty",
    "BSC": "Bharathiya Sahayog Congress",
    "BSD": "Bharatiya Samaj Dal",
    "BSK": "Bharatiya Sarvkalayan Kranti Dal",
    "BSKP": "Bharatiya Sarvodaya Kranti Party",
    "BSKPB": "Bharatiya Samaj Kalyan Party Bharat",
    "BSKRP": "Bharatiya Sampuran Krantikari Party",
    "BSP(AP)": "Bahujan Samaj Party(Ambedkar-Phule)",
    "BSP(K)": "Bahujan Sangharsh Party (Kanshiram)",
    "BSRD": "Bharatiya Subhash Sena",
    "BSSP": "Bharatiya Sadbhawna Samaj Party",
    "BSSPA": "Bharatiya Samta Samaj Party",
    "BUDM": "Bharat Uday Mission",
    "BUM": "Bahujan Uday Manch",
    "BVA": "Bahujan Vikas Aaghadi",
    "BVM": "Bharat Vikas Morcha",
    "BVP": "Bahujan Vikas Party",
    "BVVP": "Buddhiviveki Vikas Party",
    "CDF": "Christian Democratic Front",
    "CGVP": "Chhattisgarh Vikas Party",
    "CPI(ML)(L)": "Communist Party of India (Marxist-Leninist) (Liberation)",
    "CSP": "Chhattisgarhi Samaj Party",
    "DBP": "Desh Bhakt Party",
    "DBSP": "Democratic Bharatiya Samaj Party",
    "DCP": "Democratic Congress Party",
    "DESEP": "Democratic Secular Party",
    "DGPP": "Duggar Pradesh Party",
    "DMDK": "Desiya Murpokku Dravida Kazhagam",
    "DPI": "Democratic Party of India",
    "DPK": "Desia Pathukappu Kazhagam",
    "EKSP": "Eklavya Samaj Party",
    "FCI": "Federal Congress of India",
    "GGP": "Gondvana Gantantra Party",
    "GMS": "Gondwana Mukti Sena",
    "GRIP": "Great India Party",
    "HDVP": "Hind Vikas Party",
    "HJCBL": "Haryana Janhit Congress (BL)",
    "HJP": "Hindustan Janta Party",
    "HSPDP": "Hill State People's Democratic Party",
    "IBSP": "Indian Bahujan Samajwadi Party",
    "ICSP": "Indian Christian Secular Party",
    "IJP": "Indian Justice Party",
    "IPFB": "Indian People's Forward Block",
    "IPP": "Indian Peace Party",
    "IUML": "Indian Union Muslim League",
    "IVD": "Inqalab Vikas Dal",
    "JANS": "Jaganmay Nari Sangathan",
    "JBP": "Jai Bharat Party",
    "JBSP": "Jai Bharat Samanta Party",
    "JCGP": "Jai Chhattisgarh Party",
    "JCP": "Jan Chetna Party",
    "JDP": "Jharkhand Disom Party",
    "JGP": "Jago Party",
    "JHJAM": "Jharkhand Janadikhar Manch",
    "JHJM": "Jharkhand Jan Morcha",
    "JHKP": "Jana Hitkari Party",
    "JJ": "Jebamani Janata",
    "JJJKMC": "Jai Jawan Jai Kisan Mazdoor Congress",
    "JKANC": "Jammu & Kashmir Awami National Conference",
    "JKD": "Jan Ekta Dal",
    "JKM": "Jawan Kisan Morcha",
    "JKP": "Jharkhand Party",
    "JKP(N)": "Jharkhand Party (Naren)",
    "JKPP": "Jharkhand People's Party",
    "JM": "Jan Morcha",
    "JP": "Janata Party",
    "JPC": "Jammu & Kashmir People Conference",
    "JPS": "Janvadi Party(Socialist)",
    "JSP": "Jansatta Party",
    "JSS": "Jan Surajya Shakti",
    "JUP": "Janata Uday Party",
    "JVD": "Jharkhand Vikas Dal",
    "JVM": "Jharkhand Vikas Morcha (Prajatantrik)",
    "KCVP": "Kannada Chalavali Vatal Paksha",
    "KDC": "Kamarajar Deseeya Congress",
    "KKJHS": "Kranti Kari Jai Hind Sena",
    "KM": "Krantisena Maharashtra",
    "KNMK": "Kongu Nadu Munnetra Kazhagam",
    "KOKD": "Kosal Kranti Dal",
    "KS": "Kalinga Sena",
    "KSVP": "Krantikari Samyavadi Party",
    "KTMK": "Karnataka Thamizhar Munnetra Kazhagam",
    "KVSP": "Kosi Vikas Party",
    "LB": "Lok Bharati",
    "LBP": "Lok Bhalai Party",
    "LD": "Lok Dal",
    "LJVM": "Lok Jan Vikas Morcha",
    "LKJP": "Loktanrik Janata Party (Secular)",
    "LKSGM": "Loksangram",
    "LKSP": "Loktanrik Sarkar Party",
    "LM": "Lal Morcha",
    "LPSP": "Lokpriya Samaj Party",
    "LSP": "Lok Satta Party",
    "LSVP": "Laghujan Samaj Vikas Party",
    "LSWP": "Loktantrik Samajwadi Party",
    "LTSD": "Loktantrik Samata Dal",
    "LVKP": "Lok Vikas Party",
    "MADP": "Moulik Adhikar Party",
    "MAMAK": "Manithaneya Makkal Katchi",
    "MANP": "Mana Party",
    "MAP": "Mahila Adhikar Party",
    "MB(S)P": "Mool Bharati (S) Party",
    "MBP": "Matra Bhakta Party",
    "MC": "Momin Conference",
    "MCO": "Marxist Co-Ordination",
    "MCPI(S)": "Marxist Communist Party of India (S.S. Srivastava)",
    "MD": "Mahan Dal",
    "MDP": "Meghalaya Democratic Party",
    "MJP": "Mahagujarat Janta Party",
    "MKD": "Maidani Kranti Dal",
    "MKUP": "Majdoor Kisan Union Party",
    "MMKA": "Makkal Manadu Katchi",
    "MMM": "Manav Mukti Morcha",
    "MMUP": "Muslim Majlis Uttar Pradesh",
    "MNS": "Maharashtra Navnirman Sena",
    "MOP": "Moderate Party",
    "NBNP": "Navbharat Nirman Party",
    "NDEP": "National Development Party",
    "NDPF": "National Democratic Peoples Front",
    "NELU": "Nelopa(United)",
    "NLHP": "National Lokhind Party",
    "NLP": "National Loktantrik Party",
    "NMK": "Namadhu Makkal Katchi",
    "NSCP": "National Secular Party",
    "NSSP": "Niswarth Sewa Party",
    "NYP": "National Youth Party",
    "OMM": "Orissa Mukti Morcha",
    "PBHP": "Praja Bharath Party",
    "PDA": "People's Democratic Alliance",
    "PDF": "People's Democratic Front",
    "PDFO": "People's Democratic Forum",
    "PDS": "Party for Democratic Socialism",
    "PECP": "Peace Party",
    "PG": "Peoples Guardian",
    "PKMK": "Pachai Kudi Makkal Katchi",
    "PLP": "Punjab Labour Party",
    "PMSP": "Pragatisheel Manav Samaj Party",
    "PNK": "Puthiya Needhi Katchi",
    "PPA": "People's Party of Arunachal",
    "PPIS": "Peoples Party of India(secular)",
    "PPOI": "Pyramid Party of India",
    "PRAP": "Praja Rajyam Party",
    "PRBD": "Purvanchal Rajya Banao Dal",
    "PRBP": "Peoples Republican Party",
    "PRCP": "Prabuddha Republican Party",
    "PRPI": "Professionals Party of India",
    "PRSP": "Prajatantrik Samadhan Party",
    "PT": "Puthiya Tamilagam",
    "PTSS": "Proutist Sarva Samaj",
    "RAD": "Rashtriya Agraniye Dal",
    "RAJUP": "Rashtriya Janutthan Party",
    "RALOP": "Rashtriya Lokwadi Party",
    "RALP": "Rashtrawadi Labour Party",
    "RASAP": "Rashtriya Sahara Party",
    "RASD": "Rashtravadi Aarthik Swatantrata Dal",
    "RASJP": "Rashtriya Janhit Party",
    "RBCP": "Rashtriya Bahujan Congress Party",
    "RBD": "Rashtra Bhakt Dal",
    "RCP": "Rashtravadi Communist Party",
    "RCPI(R)": "Revolutionary Communist Party of India (Rasik Bhatt)",
    "RDHP": "Rajyadhikara Party",
    "RDMP": "Rashtriya Dehat Morcha Party",
    "RDSD": "Rajasthan Dev Sena Dal",
    "RGOP": "Rashtriya Gondvana Party",
    "RJAP": "Rashtriya Janadhikar Party",
    "RJJM": "Rashtriya Jan-Jagram Morcha",
    "RJPK": "Rashtriya Janwadi Party (Krantikari)",
    "RJSD": "Rashtriya Jan Sahay Dal",
    "RJVP": "Rajasthan Vikas Party",
    "RKJP": "Rashtriya Krantikari Janata Party",
    "RKSP": "Rashtriya Krantikari Samajwadi Party",
    "RLD": "Rashtriya Lok Dal",
    "RLP": "Rashtriya Lokhit Party",
    "RMEP": "Rashtriya Mazdoor Ekta Party",
    "RMGLMP": "Rashtriya Mangalam Party",
    "RMSP": "Rashtriya Machhua Samaj Party",
    "RND": "Rashtriya Naujawan Dal",
    "RNSP": "Rajya Nojawan Shakti Party",
    "RP(K)": "Republican Paksha (Khoripa)",
    "RPC(S)": "Rashtriya Praja Congress (Secular)",
    "RPI": "Republican Party of India",
    "RPI(A)": "Republican Party of India (A)",
    "RPI(D)": "Republican Party of India (Democratic )",
    "RPI(KH)": "Republican Party of India (Khobragade)",
    "RPIE": "Republician Party of India Ektawadi",
    "RPP": "Rashtriya Pragati Party",
    "RPPI": "Republican Presidium Party of India",
    "RRD": "Rashtriya Raksha Dal",
    "RRS": "Rayalaseema Rashtra Samithi",
    "RSBP": "Rashtriya Swabhimaan Party",
    "RSMD": "Rashtriya Samanta Dal",
    "RSP(S)": "Rastriya Samajwadi Party (Secular)",
    "RSPS": "Rashtriya Samaj Paksha",
    "RSUPRP": "Rashtriya Surya Prakash Party",
    "RSWD": "Rashtra Sewa Dal",
    "RTKP": "Rashtriya Kranti Party",
    "RVNP": "Rashtravadi Janata Party",
    "RVP": "Rashtriya Vikas Party",
    "RWS": "Rashtrawadi Sena",
    "RWSP": "Rashtrawadi Samaj Party",
    "RYS": "Rashtriya Yuva Sangh",
    "SAD(M)": "Shiromani Akali Dal (Amritsar)(Simranjit Singh Mann)",
    "SAMO": "Samruddha Odisha",
    "SAP": "Samata Party",
    "SBSP": "Suheldev Bhartiya Samaj Party",
    "SGPP": "Sikkim Gorkha Prajatantric Party",
    "SHRP": "Sikkim Himali Rajya Parishad Party",
    "SJEP": "Sikkim Jan-Ekta Party",
    "SJP(R)": "Samajwadi Janata Party (Rashtriya)",
    "SJTP": "Samajik Jantantrik Party",
    "SKP": "Sarvodaya Karnataka Paksha",
    "SLP(L)": "Socialist Party (Lohia)",
    "SMBHP": "Smast Bhartiya Party",
    "SSBD": "Shakti Sena (Bharat Desh)",
    "SSD": "Shoshit Samaj Dal",
    "STBP": "Swatantra Bharat Paksha",
    "STPI": "Samajtantric Party of India",
    "SUSP": "Sunder Samaj Party",
    "SVPP": "Sardar Vallabhbhai Patel Party",
    "SVRP": "Shivrajya Party",
    "SVSP": "Savarn Samaj Party",
    "SWJP": "Samajwadi Jan Parishad",
    "SWP": "Swabhimani Paksha",
    "SWPI": "Swarajya Party Of India",
    "THPI": "The Humanist Party of India",
    "TPPP": "Trilinga Praja Pragati Party",
    "UCPI": "United Communist Party of India",
    "UGDP": "United Goans Democratic Party",
    "UMK": "Ulzaipali Makkal Katchy",
    "UNLP": "United National Loktantrik Party",
    "UPRP": "Uttar Pradesh Republican Party",
    "UWF": "United Women Front",
    "VAJP": "Vanchit Jamat Party",
    "VCK": "Viduthalai Chiruthaigal Katchi",
    "VHS": "Vishva Hindustani Sangathan",
    "VP": "Vikas Party",
    "VVS": "Vishwa Vikas Sangh",
    "YFE": "Youth For Equality",
    "YSP": "Youth And Students Party",
    "YVP": "Yuva Vikas Party",
    "IND": "Independent"
};
