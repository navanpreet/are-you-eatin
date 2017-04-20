'use strict'
let d3 = require('d3');

let generateImage = (data) => {

let margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;


// set the ranges
let x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

let y = d3.scale.linear().range([height, 0]);

// define the axis
let xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")


let yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);


// add the SVG element
let svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");


// load the data
let data =  [ { date: '08-01-2016', perc: 66 },
  { date: '08-03-2016', perc: 90 },
  { date: '08-02-2016', perc: 25 } ];

  data.forEach(function(d) {
    d.date = d.date;
    d.perc = d.perc;
      
  	
    // scale the range of the data
    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, 100]);

    // add axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");


    // Add bar chart
    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.date); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.perc); })
        .attr("height", function(d) { return height - y(d.perc); });
  });
}   

module.exports.generateImage = generateImage; 