var scenarioNumber = 0;
var content;

var scenarios = [
	{
		"text" : "<strong>A Big BJP win.</strong> The party win 200 or more seats, plus scores coming from parties with which it has concluded “pre-poll” alliances. After results are clear, at least one of the bigger regional parties joins a coalition as well as some smaller groupings, giving the new United Democratic Alliance an easy absolute majority, and close to two thirds of parliamentary seats. Narendra Modi is named prime minister.",
		"image": "images/happymodi.jpg"
	},{
		"text" : "<strong>A narrower BJP win.</strong> BJP and their allies win around 140 to 180. Frantic negotiations follow with major powerbrokers such as Jayalalithaa Jayaram in Tamil Nadu or Mamata Banerjee in West Bengal. A sufficiently strong coalition is put together to form a government, after significant concessions are made to new allies. One could conceivably be that Modi stands aside for a candidate who is seen as less divisive.",
		"image": "images/sadmodi.jpg"
	},{
		"text" : "<strong>BJP, but only just.</strong> Surprisingly small gains for BJP only allow a weak coalition which lasts six to 18 months until a major ally pulls the plug.",
		"image": "images/flatmodi.jpg"
	},{
		"text" : "<strong>Congress, by a whisker.</strong> Surprisingly small gains for BJP allow Congress, suddenly full of vim and vigour after being written off too early, to pull together a weak coalition … which lasts six to 18 months until a major ally pulls the plug.",
		"image": "images/happyrahul.jpg"
	},{
		"text" : "<strong>Third Front.</strong> With neither BJP nor Congress doing well, a coalition of regional, single issue and left wing parties forms a weak and unstable national government, possibly with either Congress or the BJP offering some support … which lasts six to 18 months.",
		"image": "images/happybanerjee.jpg"
	},{
		"text" : "<strong>The Common Man.</strong> Under this scenario it turns out that every analyst and pollster in India has vastly underestimated support levels for the Aam Admi Party, who sweep 150 seats, collect a series of allies and form a government. Possibly the most interesting outcome, but very, very unlikely.",
		"image": "images/happykerjiwal.jpg"
	}
]

$(function(){
	content = scenarios[scenarioNumber];
	fillTextContainer();
	
	$('.scenario').on('click', function(){
		$('.scenario').removeClass('current');
		$(this).addClass('current');
		scenarioNumber = $(this)[0].dataset.name;
		content = scenarios[scenarioNumber];
		fillTextContainer();
	});
		
});


function fillTextContainer(){
	$('.textContainer').html('<img src="' + content.image + '" /><p>' + content.text + '</p>')
}