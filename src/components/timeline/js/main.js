var data;
var firstYear = 1947;
var lastYear = 2014;
var w = $(window).width() - 20;
var h = 250;
var r = 40;
var pi = Math.PI;
var colors = {
	"BJP":"#7D0068",
	"INC":"#F5644F",
	"Janata Party":"#6BA83F",
	"Janata Dal":"#FFBB00",
	"Samajwadi Janata Party":"#D23E55"
}
var padding = 12;

$(document).ready(function(){
	d3.json("js/data.json", function(error, json) {
  		if (error) return console.warn(error);
  		
  		data = json;
  		createTimeline();
	});
	
});

function createTimeline(){
	var scaleX = d3.scale.linear()
		.domain([firstYear, lastYear])
		.range([0 + padding , w - padding]);

	var timeline = d3.select(".timeline")
		.style("width", w + "px")
		.style("height", h + "px")

	var main = timeline.append("div")
		.attr("class", "main");

	var timelineItem = main.selectAll(".timelineItem")
		.data(data)
		.enter().append("div").attr('class','timelineItem')
		.style("left", function(d){
			return scaleX(d.startYear)+ "px";
		})
		.style("width", function(d){
			// return "50px";
			return scaleX(d.endYear) - scaleX(d.startYear) -1+ "px";
		})
	
	var itemDetails = timelineItem.append('div')
		.attr('class', 'itemDetails')



	var itemBar  = timelineItem.append('div')
		.attr('class','itemBar')
		.style('width', '100%')
		.style('height', "20px")
		.style("background-color",function(d){
			return colors[d.leader]
		})

	// itemBar.append('span')
	// 	.attr('class','leaderName')
	// 	.text(function(d){
	// 		return d.leader;
	// 	})

	itemDetails
		.append('h2')
		.text(function(d){
			return d.primeMinister.name;
		})

	itemDetails
		.append('p')
		.text(function(d){
			return d.leader + " " + d.startYear + " - " + d.endYear;
		})

	itemDetails
		.append('img')
		.attr({
			'src' : function(d){
				return "http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/3/24/" + d.primeMinister.picture;
			},
			'class': 'primeMinisterPicture'
		})


	itemDetails
		.append('p')
		.text(function(d){
			return d.notes;
		})
		.attr('class','note')
    
    itemDetails
		.append('div')
		.attr({
			'class': 'arrow'
		})
	var xAxis = d3.svg.axis()
		.scale(scaleX)
		.orient("bottom")
		.tickFormat(d3.format('.0f'))
		.ticks(w/80)
		.tickSize([0])

		.tickValues([1947, 1960,1970,1980,1990,2000,2014]);
		;

	var axisContainer = timeline.append("svg").attr('class','axis').append('g').attr("transform", "translate(0," + (h -35) + ")")
    .call(xAxis);

    var ticks = axisContainer.selectAll(".tick")

    	
	ticks.append("circle").attr("r", 3)	
	ticks.select("line").remove()
	ticks.select("text").attr('y','9')
		

	vizReady();
}

function vizReady(){
	$('.itemBar').on("mouseenter", function(){
		var $timelineItem = $(this).parent();
		$(".itemDetails", $timelineItem).css({
			'opacity':1,
		})


	});
	$('.itemBar').on("mouseleave", function(){
		var $timelineItem = $(this).parent();
		$(".itemDetails", $timelineItem).css({
			'opacity':0,
		})
	});
	

	$('.itemDetails').each(function(i,j){
	var tooMuch = w - 150;

	if($(j).offset().left > tooMuch){
		var overschrijding = $(j).offset().left - tooMuch;

		$(j).css('margin-left', -overschrijding)
		$(j).find('.arrow').css('margin-left', overschrijding -5);
	}

	if($(j).offset().left <0){
		var overschrijding = 10 - $(j).offset().left;
		
		$(j).css('margin-left', overschrijding +10)
		$(j).find('.arrow').css('margin-left', -overschrijding -5);
	}
	});
}

