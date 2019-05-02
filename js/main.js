/*
*    main.js
*    Final Oroject
*/

var margin = {left:80, right:20, top:50, bottom: 100};
var height = 800 - margin.top - margin.bottom,
	width = 120000 - margin.left - margin.right;
	
var g = d3.select("#chart-area")
		.append("svg")
			.attr("width", width+margin.left+margin.right)
			.attr("height", height+margin.top+margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left +
								", " + margin.top + ")");

var time = 0;
var interval;
var Data;

//Tooltip
var tip = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		var text = "<strong>Ward: </strong><span style='color:orange;text-transform:capitalize;'>"
					+ d.ward + "</span><br>";
		text += "<strong>Length of Stay: </strong><span style='color:orange'>"
					+ d3.format("0.2f")(d.lengthofstay) + "</span><br>";
		text += "<strong>Score: </strong><span style='color:orange'>"
					+ d3.format("$,.0f")(d.score) + "</span><br>";
		text += "<strong>Cost of Care: </strong><span style='color:orange'>"
					+ d3.format(",.0f")(d.charge) + "</span>";			
		return text;
	})

g.call(tip);

//Scales

//x scale
var xScale = d3.scaleLinear()
		.domain([-1, 14])
		.range([0, width]);
//y scale
var yScale = d3.scaleLinear()
		.domain([0, 33])
		.range([height, 0]);

//area scale
var area = d3.scaleLinear()
		.domain([0, 5000000])
		.range([25*Math.PI, 1500*Math.PI]);

//continent colors
var wardColor = d3.scaleOrdinal(d3.schemePastel1);

//Labels
var xLabel = g.append("text")
		.attr("x", width / 2)
		.attr("y", height + 50)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Disease Severity Score");

var yLabel = g.append("text")
		.attr("x", -170)
		.attr("y", -40)
		.attr("transform", "rotate(-90)")
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Lenghth of hospital Stay (Days)");

var timeLabel = g.append("text")
		.attr("x", width - 40)
		.attr("y", height - 10)
		.attr("font-size", "40px")
		.attr("opacity", "0.4")
		.attr("text-anchor", "middle")
		.text("2008");

//x axis
var xAxisCall = d3.axisBottom(xScale)
		.tickValues([2,4,6,8]);
		g.append("g")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxisCall);

//y axis
var yAxisCall = d3.axisLeft(yScale)
		.tickFormat(function(d){ return +d; })
		
g.append("g")
	.call(yAxisCall);
	

//legend section
var wards = ["1", "2", "3", "4", "5", "6", "7", "8"];

var legend = g.append("g")
		.attr("transform", "translate(" + (width-10) + ", " +
										  (height-240) + ")");

wards.forEach(function(ward, i){
	var legendRow = legend.append("g")
			.attr("transform", "translate(0," + (i*20) + ")");
			
	legendRow.append("rect")
		.attr("width", "10")
		.attr("height", "10")
		.attr("fill", wardColor(ward));
		
	legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.text(ward);
}); //forEach
										  
//getting the data
d3.json("data/data.json").then(function(data){
	console.log(data);
	
	//clean data
	formattedData = data.map(function(year){
		return year["patients"].filter(function(fin){
			var dataExists = (fin.score && fin.lengthofstay <30)
		return dataExists;
		}).map(function(fin){
			fin.score = +fin.score;
			fin.lengthofstay = +fin.lengthofstay;
			return fin;
		})
	});
	
	//console.log(formattedData);
	
	//run the code every 0.1 second (100 ms) 
	//commented out the old code
	/*d3.interval(function(){
		time = (time < 214) ? time+1 : 0;
		update(formattedData[time]); //run update for current year...
	}, 100) //...every 100 ms */
	
	//first run of the visualization
//update(formattedData[0]);
	
}); //d3.json

function step() {
	time = (time < 12) ? time+1 : 0;
	update(formattedData[time]);
} //step

$("#play-button")
	.on("click", function(){
		var button = $(this);
		if (button.text() == "Play") {
			interval = setInterval(step, 200);
			button.text("Pause");
		}
		else {
			button.text("Play");
			clearInterval(interval); //Pause
		}
	})

$("#reset-button")
	.on("click", function(){
		time = 0;
		update(formattedData[time]);
	})
	
$("#ward-select")
	.on("change", function(){
		update(formattedData[time]); //make sure filter works
	})								 //during Pause

$("#date-slider").slider({
	max: 2018,
	min: 2008,
	step: 1,
	slide: function(event, ui){
		time = ui.value - 2008;
		update(formattedData[time]);
	}
})

function update(data){
	//standard transition time for the visualization
	var t = d3.transition().duration(200);
	
	var ward = $("#ward-select").val();
	
	var data = data.filter(function(d){
		if (ward == "all") {return true;}
		else {
			return d.ward == ward;
		}
	});
	
	//join new data with old elements
	var circles = g.selectAll("circle")
			.data(data, function(d){
				return d.fin;
			});
			
	//exit old elements not present in new data
	circles.exit()
		.attr("class", "exit")
		.remove();
		
	//enter new elements present in our data
	circles.enter()
		.append("circle")
			.attr("class", "enter")
			.attr("fill", function(d){ 
				return wardColor(d.ward);
			})
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide)
			.merge(circles)
			.transition(t)
				.attr("cy", function(d){ return yScale(d.lengthofstay); })
				.attr("cx", function(d) { return xScale(d.score); })
				.attr("r", function(d) { 
					return Math.sqrt(area(d.charge) / Math.PI) 
				})
	
	//update the time label
	timeLabel.text(+(time +2008));
	$("#year")[0].innerHTML = +(time+2008);
	$("#date-slider").slider("value", +(time+2008)); //make the
												//slider move as the
												//graph updates
	
} //update