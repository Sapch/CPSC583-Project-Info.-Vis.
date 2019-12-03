
function showScatterplot(clickedCountries) {

  let width = document.body.clientWidth, height = 1200,
    scatterWidth = 1800, scatterHeight = 1100;
    margin = {top: 70, right: 300, bottom: 70, left: 100},
    circleSize = [3, 5, 8],
    keys = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"],
    darkLayer = d3.select('.scatter'),
    myColor = d3.scaleOrdinal(d3.schemeSet1);

  let scatterplot = darkLayer.append('g')
    .attr('class', 'secondVis')
    .attr('width', scatterWidth)
    .attr('height', scatterHeight)
    .attr("transform", 'translate('+((width/2)-900)+',50)');

  //scatterplot background
  scatterplot.append('rect')
    .attr('width', scatterWidth)
    .attr('height', scatterHeight)
    .attr('rx', 12)
    .attr('ry', 12)
    .style('fill', 'grey');

  //scatterplot close button
  scatterplot.append('text')
    .attr('x', scatterWidth-40)
    .attr('y', 40)
    .style('fill', 'black')
    .style('cursor', 'pointer')
    .attr('font-size', '35px')
    .style('font-family', "Arial")
    .text('x')
    .on('click', () => {
      scatterplot.remove();
      darkLayer.style('visibility', 'hidden');
    });

  // create a clipping region
  scatterplot.append("g").append("clipPath")
    .attr("id", "clipper")
    .append("rect")
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr("width", scatterWidth-margin.left-margin.right)
    .attr("height", scatterHeight-margin.top-margin.bottom);

    //y axis title
  scatterplot.append("text")
    .attr("transform", "rotate(-90)")
    .attr('y', 35)
    .attr('x', -scatterHeight/2)
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("font-size", 32)
    .attr("text-anchor", "middle")
    .text("GDP per Capita");

    //x axis title
  scatterplot.append("text")
    .attr("y", scatterHeight-20)
    .attr("x", ((scatterWidth-margin.right-margin.left)/2)+margin.left)
    .attr("fill", "#000")
    .attr("font-size", 32)
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("Gini Coefficient (Economic Inequality)");

    //legend rectangles
  var size = 30
  scatterplot.selectAll('legend')
    .data(keys)
    .enter()
    .append("rect")
      .attr("x", scatterWidth-250)
      .attr("y", function(d,i){
        return 150 + i*(size+5);
      })
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d, i){
        return myColor(d);
      });

  //legend labels
  scatterplot.selectAll('label')
    .data(keys)
    .enter()
    .append("text")
      .attr("x", scatterWidth-200)
      .attr("y", function(d,i){
        return 170 + i*(size+5);})
      .text(function(d){
        return d;})
      .style("fill", "#000")
      .attr("font-size", 22)
      .attr("text-anchor", "start")
      .attr("font-weight", "bold");

    //Happiness legend circle
  scatterplot.selectAll('legend')
    .data(circleSize)
    .enter()
    .append("circle")
      .attr("cx",  scatterWidth-180)
      .attr("cy", function(d,i) {
        if (i == 0) return 500;
        if(i == 2) return 640;
        return  450 + ((d**1.8)*2) + (i*65);
      })
      .attr("r", function(d){
        return d**1.8
      })
      .style("fill", 'white')
      .style("opacity", "0.7")
      .attr("stroke", "black")
      .style("stroke-width", "2px");

  //Happiness legend value
  scatterplot.selectAll('label')
    .data(circleSize)
    .enter()
    .append("text")
      .attr("x",  scatterWidth-120)
      .attr("y", function(d,i){
        if (i == 0) return 510;
          if(i == 2) return 650;
        return  460 + ((d**1.8)*2) + (i*65);
      })
      .text(function(d){ return d;})
      .style("fill", "#000")
      .attr("font-size", 32)
      .attr("text-anchor", "start")
      .attr("font-weight", "bold");

  //Happiness legend title
  scatterplot.append("text")
    .attr("x",  scatterWidth-250)
    .attr("y", 440)
    .text("Happiness Score")
    .style("fill", "#000")
    .attr("font-size", 30)
    .attr("text-anchor", "start")
    .attr("font-weight", "bold");


  d3.csv("Data-id.csv").then( function(data) {

    var yTicks = 14;

    if (clickedCountries.length > 0) {
      data = data.filter((d) => {
        return clickedCountries.includes(d.CountryID);
      });
      if (!clickedCountries.includes('QAT')) yTicks = 10;
    }

    // create scale objects
    var xScale = d3.scaleLinear()
      .domain([20, 70])
      .range([margin.left, scatterWidth-margin.right]);
    var yScale = d3.scaleLinear()
      .domain([-10, yTicks*10])
      .range([scatterHeight-margin.bottom, margin.top]);
      // Add a scale for bubble size
    var zScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, 12]);

    // create axis objects
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // Draw Axis
    var gX = scatterplot.append('g')
      .attr("transform", "translate(0," + (scatterHeight-margin.bottom) +  ")")
      .call(xAxis.ticks(14).tickSize(-960))
      .attr("font-size", 18);
    var gY = scatterplot.append('g')
      .attr("transform", 'translate('+margin.left+',0)')
      .call(yAxis.ticks(yTicks).tickSize(-1400))
      .attr("font-size", 18);

    // Draw Datapoints
    var circlesG = scatterplot.append("g")
      .attr("clip-path", "url(#clipper)")
      .classed("circlesG", false);

      var circlesG1 = scatterplot.append("g");
          //.classed("circlesG", true);

    var circles = circlesG.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("class", d => { return "dot COUNTRY-"+ d.Country; } )
        .attr('cx', function(d) {return xScale(d.Gini)})
        .attr('cy', function(d) {return yScale(d.GDP/1000)})
        .attr("r", function (d) { return zScale(d.Happiness ** 1.8); } )
        .style("fill", function (d) { return myColor(d.Continent); } )
        .style("opacity", "0.7")
        .attr("stroke", "black")
        .style("stroke-width", "2px");
        // .on("mouseover", function(d) {
        //     var xPosition = d3.mouse(this)[0];
        //     var yPosition = d3.mouse(this)[1]-40;
        //
        //     console.log("hello")
        //     tooltip.transition()
        //         .duration(100)
        //         .style("opacity", 0.9);
        //
        //     tooltip.html(d.Happiness)
        //         .style("left", (d3.event.pageX) + "px")
        //         .style("font-size", "17px")
        //         .style("font-weight", "bold")
        //         .style("top", (d3.event.pageY - 28) + "px");
        //
        //     // scatterplot.select('.tooltipText')
        //     //     .attr("x", xPosition)
        //     //     .attr("y", yPosition)
        //     //     .text(d.Country  + " Happiness Score: " + Math.round(parseFloat(d.Happiness)*100)/100)
        //     //     .style("display", "inline");
        // })
        // .on("mouseout", function() {
        //     scatterplot.select('.tooltipText')
        //         .style("display", "none");
        // });

   //     drawCircles();

      function drawCircles() {
          circlesG1.selectAll(".dot")
              .data(data)
              .enter()
              .append("circle")
              .attr("class", d => {return "dot"})
              .attr('cx', function (d) {return xScale(d.Gini)})
              .attr('cy', function (d) {return yScale(d.GDP / 1000)})
              .attr("r", function (d) {return zScale(d.Happiness ** 1.8);})
              // .style("fill", function (d) {
              //     return myColor(d.Continent);
              // })
               .style("opacity", "0.7")
               .attr("stroke", "black")
               .style("stroke-width", "2px")
              .attr("fill", "transparent")
              .style('cursor', 'pointer')
              .on('mouseover', function (d) {
                  var xPosition = d3.mouse(this)[0];
                  var yPosition = d3.mouse(this)[1] - 40;

                  console.log("hello")
                  tooltip.transition()
                      .duration(100)
                      .style("opacity", 0.9);

                  tooltip.html(d.Happiness)
                      .style("left", (d3.event.pageX) + "px")
                      .style("font-size", "17px")
                      .style("font-weight", "bold")
                      .style("top", (d3.event.pageY - 28) + "px");

                  // scatterplot.select('.tooltipText')
                  //     .attr("x", xPosition)
                  //     .attr("y", yPosition)
                  //     .text(d.Country  + " Happiness Score: " + Math.round(parseFloat(d.Happiness)*100)/100)
                  //     .style("display", "inline");
              })
              .on("mouseout", function () {
                  scatterplot.select('.tooltipText')
                      .style("display", "none");
              });
      }


    // Pan and zoom
    var zoom = d3.zoom()
        .scaleExtent([.5, 20])
        .extent([[0, 0], [scatterWidth-margin.left-margin.right, scatterHeight-margin.top-margin.bottom]])
        .on("zoom", zoomed);

    scatterplot.append("rect")
        .attr("width", scatterWidth-margin.left-margin.right)
        .attr("height", scatterHeight-margin.top-margin.bottom)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom);

    function zoomed() {
    // create new scale ojects based on event
        var new_xScale = d3.event.transform.rescaleX(xScale);
        var new_yScale = d3.event.transform.rescaleY(yScale);
    // update axes
        gX.call(xAxis.scale(new_xScale));
        gY.call(yAxis.scale(new_yScale));
        circles.data(data)
         .attr('cx', function(d) {return new_xScale(d.Gini)})
         .attr('cy', function(d) {return new_yScale(d.GDP/1000)});
    }

    darkLayer.style('visibility', 'visible');

  });
}
