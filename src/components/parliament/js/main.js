var w;
var screenWidth = $(window).width();
if(screenWidth>=540 && screenWidth < 620){
	w = screenWidth -280;
}else if(screenWidth>=620){
	w = 620 - 280;
}else{
	w = screenWidth -20;
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
	"Congress and former partners" : "#4BC6DF",
	"Former Congress supporters" : "#4490CE",
	"BJP and former partners" : "#FFBB00",
	"Others" : "#F66980",
	"Other Parties and Independents" : "#D23E55"
}
var $tooltip;
var degree = Math.PI/180; // just to convert the radian-numbers

$(function(){
	d3.json("js/data.json", function(error, json) {
  		if (error) return console.warn(error);
        $.each(json['alliance-data'],function(i,j){
            $.each(json['2009-data'],function(x,y){
                if(y.Alliance === j.Alliance){
                    j['2009-data'] = j['2009-data'] + y.Seats; 
                }
            });
            $.each(json['2014-data'],function(x,y){
                if(y.Alliance === j.Alliance){
                    j['2014-data'] = j['2014-data'] + y.Seats; 
                }
            });
        });
  		data = json;
  		create2014PartyChart();
	});
	$tooltip = $('.tooltip');
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
        .style({
            "width" : w + "px"
        })
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
		.attr("transform","translate("+r+","+r+")")

	var arc = d3.svg.arc()
        .outerRadius(r);

    var pie = d3.layout.pie()
        .value(function(d) {
        	return d.Seats; 
        })
        .sort(null)
		.startAngle(-90*degree).endAngle(90*degree);

    var arcs = results.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie(data["2014-data"]))                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()
        .append('g')
        .attr('class','slice')
        .on("mouseover", function(d){
        	$tooltip.html("<p class='tooltipAlliance'><span class='allianceColor' style='color:"+colors[d.data.Alliance]+";'>" +d.data.Alliance+"</span></p><p class='tooltipParty'>" + d.data.Party + "</p><p class='tooltipSeats'> "+d.data.Seats+" seats</p>")
        	$tooltip.css("border-color",colors[d.data.Alliance]);
        })
        .on("mouseleave", function(d){
        	$tooltip.html("<p class='tooltipStatus'>Hover over a party to see more information</p>")
        	$tooltip.css("border-color",colors[d.data.Alliance]);
        	$tooltip.css("border-color","#333");
        });

    var centreLine = partyChartWrapper
        .append('line')
        .attr('class', 'centreLine')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', -h)
        .attr('y2', 10)
        .attr('stroke-width', 2)
        .attr('stroke', "rgba(0,0,0,1)")
    
    arcs.append("path")
        .attr("fill", function(d, i) { return colors[d.data.Alliance] } ) 
        .attr("d", arc);

    var legend = d3.select('.legend').selectAll('p')
        .data(data["alliance-data"])
        
        .html(function(d){
            return "<span class='allianceColor' style='background-color:" + colors[d.Alliance] + ";'></span>" +d.Alliance + " (" +  d['2014-data']+ " seats)";
        })



    this.updateData = function(dataset){
        results.selectAll("g.slice") 
            .data(pie(data[dataset]))
            .select("path")
            .transition()
            .ease("linear")
            .duration(1000)
            .attr("fill", function(d, i) { return colors[d.data.Alliance] } ) 
            .attr("d", arc);

        legend.data(data["alliance-data"])
        
        .html(function(d){
            return "<span class='allianceColor' style='background-color:" + colors[d.Alliance] + ";'></span>" +d.Alliance + " (" +  d[dataset]+ " seats)";
        })
    }
                    
}

