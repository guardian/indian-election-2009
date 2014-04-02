var w;
var screenWidth = $(window).width();
console.log(screenWidth);
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
var dataAlliances = [
	{"Alliance":"UPA, governing coalition", "Seats":229},
	{"Alliance":"Supporters of UPA","Seats":138},
	{"Alliance":"NDA, opposition of UPA","Seats": 75},
	{"Alliance":"Others","Seats":26}
];
colors = {
	"UPA, governing coalition" : "#005689",
	"Supporters of UPA" : "#4490CE",
	"NDA, opposition of UPA" : "#6BA83F",
	"Others" : "#F66980",
	"Other Parties and Independents" : "#D23E55"
}
var $tooltip;
var degree = Math.PI/180; // just to convert the radian-numbers

$(function(){

	console.log(w);
	d3.json("js/data.json", function(error, json) {
  		if (error) return console.warn(error);
  		
  		data = json;
  		createPartyChart();
	});
	$tooltip = $('.tooltip');
});



function createPartyChart(){
	var partyChartWrapper = d3.select('.pie-chart')
        .style({
            "width" : w + "px"
        })
		.select('.pies')
        .style({
            "height" : h + 20 + "px",
            "width" : w + "px"
        })
		.append('div')
		.attr('class','parties')
		.append('svg')
		.data([data])
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

    var arcs = partyChartWrapper.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
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
                    
}