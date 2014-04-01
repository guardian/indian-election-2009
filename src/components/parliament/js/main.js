var w;
var screenWidth = $(window).width();
console.log(screenWidth);
if(screenWidth>=540 && screenWidth < 620){
	w = screenWidth -250;
}else if(screenWidth>=620){
	w = 620 - 250;
}else{
	w = screenWidth -20;
}	
var data;
var h = w/2;
var padding = 10;
var r = h;
var wParty = w-padding;
var hParty = wParty/2;
var rParty = hParty;
var dataAlliances = [
	{"Alliance":"United Progressive Alliance (coalition)", "Seats":229},
	{"Alliance":"National Democratic Alliance","Seats":138},
	{"Alliance":"Third Front","Seats": 75},
	{"Alliance":"Fourth Front","Seats":26},
	{"Alliance":"Other Parties and Independents","Seats":75}
];
colors = {
	"United Progressive Alliance (coalition)" : "#005689",
	"National Democratic Alliance" : "#FB8935",
	"Third Front" : "#6BA83F",
	"Fourth Front" : "#F66980",
	"Other Parties and Independents" : "#D23E55"
}
var $tooltip;
var degree = Math.PI/180; // just to convert the radian-numbers

$(function(){

	console.log(w);
	d3.json("js/data.json", function(error, json) {
  		if (error) return console.warn(error);
  		
  		data = json;
  		createAllianceChart();
  		createPartyChart();
	});
	$tooltip = $('.tooltip');
});

function createAllianceChart(){
	var pieChartWrapper = d3.select('.pie-chart').style({
			"width"	: w + "px"
		})
		.select('.pies')
		.style({
			"height" : h + "px",
			"width"	: w + "px"
		})
		.append('div')
		.attr('class','alliances')
		.append('svg')
		.data([dataAlliances])
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

    var arcs = pieChartWrapper.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()
        .append('g')
        .attr('class','slice')    

    arcs.append("path")
        .attr("fill", function(d, i) { return colors[d.data.Alliance] } ) 

        .attr("d", arc); 

    arcs.append("text")                                     
        .attr("transform", function(d) {                    
       		d.innerRadius = 0;
        	d.outerRadius = r;
        	return "translate(" + arc.centroid(d) + ")";        
    	})
    	.attr("text-anchor", "middle")                         
    	// .text(function(d, i) { console.log(d);return d.data.Alliance; });                    
                    
}

function createPartyChart(){
	var partyChartWrapper = d3.select('.pie-chart')
		.select('.pies')
		.append('div')
		.attr('class','parties')
		.append('svg')
		.data([data])
		.attr("height",hParty)
		.attr("width",wParty)
		.append('g')
		.attr("transform","translate("+rParty+","+rParty+")")

	var arc = d3.svg.arc()
        .outerRadius(rParty);

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
        	$tooltip.html("<p class='tooltipAlliance'><span class='allianceColor' style='color:"+colors[d.data.Alliance]+";'> Part of the "+d.data.Alliance+"</span></p><p class='tooltipParty'>" + d.data.Party + "</p><p class='tooltipSeats'> "+d.data.Seats+" seats</p>")
        	$tooltip.css("border-color",colors[d.data.Alliance]);

        })
        .on("mouseleave", function(d){
        	$tooltip.html("<p class='tooltipStatus'>Hover over a party to see more information</p>")
        	$tooltip.css("border-color",colors[d.data.Alliance]);
        	$tooltip.css("border-color","#333");
        });


    arcs.append("path")
        .attr("fill", function(d, i) { return colors[d.data.Alliance] } ) 
        .attr("d", arc);                 
                    
}