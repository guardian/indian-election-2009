var w;
var screenWidth = $(window).width();
if(screenWidth <= 400){
    w = 160;
}else if(screenWidth>400 && screenWidth <= 600){
	w = 300;
}else if(screenWidth>600){
	w = 600 - 260;
}
var data;
var h = w/2;
var padding = 10;
var r = h;


var dataAlliances2014 = [
	{"Alliance":"Congress and former partners", "Seats":229},
	{"Alliance":"Former Congress supporters","Seats":138},
	{"Alliance":"BJP and former partners","Seats": 75},
	{"Alliance":"Others","Seats":26}
];
colors = {
	"Indian National Congress" : "#4BC6DF",
    "Congress" : "#4BC6DF",
	"Former Congress supporters" : "#4490CE",
	"Bharatiya Janta Party" : "#FFBB00",
    "BJP" : "#FFBB00",
	"Others" : "#F66980",
	"Other Parties and Independents" : "#D23E55"
}
var $tooltip;
var degree = Math.PI/180; // just to convert the radian-numbers

$(function(){
	d3.json("../lok-sabha-2014/js/data.json", function(error, json) {
  		if (error) return console.warn(error);
  		data = json;
  		create2014PartyChart();
	});

    
    $('.2009-switch').on('click', function(){
        updateData("2009-data");
        $('.2009-switch').addClass('current');
        $('.2014-switch').removeClass('current');
    });
    $('.2014-switch').on('click', function(){
        updateData("2014-data");
        $('.2009-switch').removeClass('current');
        $('.2014-switch').addClass('current');
    });
});



function create2014PartyChart(){
	var partyChartWrapper = d3.select('.pie-chart')
        
		.select('.pies')
        .style({
            "height" : h + 20 + "px",
            "width" : w + "px"
        })

    var results = partyChartWrapper.append('div')
		.attr('class','results')
		.append('svg')
        .attr("height",h +20)
        .attr("width",w)
		.append('g')
		.attr("transform","translate("+r+","+ parseInt(r+9)+")")

	var arc = d3.svg.arc()
        .outerRadius(r);

    var pie = d3.layout.pie()
        .value(function(d) {
        	return d.Seats; 
        })
        // .sort(function(d.Seats))
		.startAngle(-90*degree).endAngle(90*degree);

    var arcs = results.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie(data["2014-data"]))                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()
        .append('g')
        .attr('class','slice')

    var centreLine = results
        .append('line')
        .attr('class', 'centreLine')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', -h)
        .attr('y2', 10)
        .attr('stroke-width', 2)
        .attr('stroke', "rgba(0,0,0,1)")
    
    arcs.append("path")
        .attr("fill", function(d, i) { 
            
                return colors[d.data.Alliance]
           
        })
        .attr("d", arc);

    var legend = d3.select('.bjpSeats')
        .html(function(d){
            return "<span class='allianceColor' style='background-color:" + colors[data['keyParties'][0].Party]  +" ;'></span>" + data['keyParties'][0].Party +"(" + data['keyParties'][0]['2014-data'] + " seats)";
            
        })

    var legend2 = d3.select('.congressSeats')
        .html(function(d){
            
            return "<span class='allianceColor' style='background-color:" + colors[data['keyParties'][1].Party]  +" ;'></span>" + data['keyParties'][1].Party +"(" + data['keyParties'][1]['2014-data'] + " seats)";
            
        })
        

    this.updateData = function(dataset){
        results.selectAll("g.slice") 
            .data(pie(data[dataset]))
            .select("path")
            .transition()
            .ease("linear")
            .duration(1000)
            .attr("fill", function(d, i) { 
                if(colors[d.data.Alliance]){
                    return colors[d.data.Alliance]
                }else{
                    return "#eeeeee"
                }
            })
            .attr("d", arc);


    legend
        .html(function(d){
            return "<span class='allianceColor' style='background-color:" + colors[data['keyParties'][0].Party]  +" ;'></span>" + data['keyParties'][0].Party +"(" + data['keyParties'][0][dataset] + " seats)";
            
        })

    legend2
        .html(function(d){
            
            return "<span class='allianceColor' style='background-color:" + colors[data['keyParties'][1].Party]  +" ;'></span>" + data['keyParties'][1].Party +"(" + data['keyParties'][1][dataset] + " seats)";
            
        })
        }           
}

