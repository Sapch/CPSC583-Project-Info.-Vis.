
function showScatterplot(clickedCountries) {

  let width = document.body.clientWidth, height = 1200,
    margin = {top: 50, right: 200 + (width-1600)/2, bottom: 50, left: (width-1600)/2},
      circleSize = [2, 6, 10],
    keys = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"],
    darkLayer = d3.select('.scatter');

  let scatterplot = darkLayer.append('g').attr('class', 'secondVis');


  scatterplot.append('rect')
      .attr('x', width/2 - 800)
      .attr('y', 50)
      .attr('width', 1800)
      .attr('height', 1100)
      .attr('rx', 12)
      .attr('ry', 12)
      .style('fill', 'grey');

  scatterplot.append('text')
      .attr('x', width/2 + 860)
      .attr('y', 90)
      .style('fill', 'black')
      .style('cursor', 'pointer')
      .attr('font-size', '35px')
      .style('font-family', "Arial")
      .text('x')
      .on('click', () => {
        scatterplot.remove();
        darkLayer.style('visibility', 'hidden');
      });

  d3.csv("Data-id.csv").then( function(data) {

    data = data.filter((d) => {
      return clickedCountries.includes(d.CountryID);
    });

    var yTicks = 10;
    if (clickedCountries.includes('QAT')) yTicks = 14;

    // Add X axis
    var x = d3.scaleLinear()
        .domain([20, 70])
        .rangeRound([ margin.left, width-margin.right]);

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, yTicks*10])
        .rangeRound([ height-margin.bottom-70, margin.top+70]);

    // Add a scale for bubble size
    var z = d3.scaleLinear()
        .domain([0, 10])
        .rangeRound([0, 10]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

      // var gX = scatterplot.append('g')
      //     // .attr('transform', 'translate(' + margin.left + ',' + (margin.top + height) + ')')
      //     .call(xAxis.ticks(8).tickSize(-800).tickFormat(d3.format("d")) .tickSizeOuter(0).scale(x))
      //     // .attr("font-size", 20)
      //     // .attr("font-weight", "bold")
      //
      // var gY = scatterplot.append('g')
      //     // .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      //     .call(yAxis.ticks(12).tickSize(-1400).tickFormat(d3.format(".2f")) .tickSizeOuter(0).scale(y))
      //     // .attr("font-size", 20)
      //     // .attr("font-weight", "bold")


    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal(d3.schemeSet1);

    //add x axis to scatterplot
   var gX = scatterplot.append("g")
        .attr("transform", "translate(0," + (height-margin.bottom-70) +  ")")
        .call(xAxis.ticks(7).tickSize(-900).tickFormat(d3.format("d")) .tickSizeOuter(0).scale(x))
        .attr("font-size", 18);

    //add y axis to scatterplot
  var gY =  scatterplot.append("g")
    .attr("transform", 'translate('+margin.left+',0)')
    .call(yAxis.ticks(yTicks).tickSize(-1200).tickFormat(d3.format("d")) .tickSizeOuter(0).scale(y))
    .attr("font-size", 18);

  scatterplot.append("text")
    .attr("transform", "rotate(-90)")
    .attr('y', (width/2) - 860)
    .attr('x', -height/2)
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("font-size", 28)
    .attr("text-anchor", "middle")
    .text("GDP");

  scatterplot.append("text")
    .attr("y", height-70)
    .attr("x", width/2 - 50)
    .attr("fill", "#000")
    .attr("font-size", 28)
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("Gini Coefficient (economic inequality)");

    //legend rectangles
    var size = 30
    scatterplot.selectAll('legend')
        .data(keys)
        .enter()
        .append("rect")
          .attr("x", width/2 + 670)
          .attr("y", function(d,i){
            return 200 + i*(size+5);
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
          .attr("x", width/2 + 720)
          .attr("y", function(d,i){
            return 220 + i*(size+5);})
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
          .attr("cx",  width/2 + 700)
          .attr("cy", function(d,i){
              if (d==2) {
                  return 500 + 90;
              }
              else{
                  return 500 + 30*d
              }})
          .attr("r", function(d,i){
              return d**1.7
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
          .attr("x",  width/2 + 770)
          .attr("y", function(d,i){
              if (d==2) {
                  return 600;
              }
              else{
                  return 510 + 30*d
              }})
          .text(function(d,i){
              return d;})
          .style("fill", "#000")
          .attr("font-size", 32)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold");



    //Happiness legend title
      scatterplot.selectAll('label')
          .data(circleSize)
          .enter()
          .append("text")
          .attr("x",  width/2 + 630)
          .attr("y", 530)
          .text("Happiness Score (0-10)")
          .style("fill", "#000")
          .attr("font-size", 24)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold");



      // Add dots
  var circles = scatterplot.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d.Gini); } )
          .attr("cy", function (d) { return y(d.GDP/1000); } )
          .attr("r", function (d) { return z(d.Happiness ** 1.7); } )
          .style("fill", function (d) { return myColor(d.Continent); } )
          .style("opacity", "0.7")
          .attr("stroke", "black")
          .style("stroke-width", "2px")
          .on("mouseover", function(d) {
            var xPosition = d3.mouse(this)[0];
            var yPosition = d3.mouse(this)[1]-40;

            scatterplot.select('.tooltipText')
              .attr("x", xPosition)
              .attr("y", yPosition)
              .text(d.Country  + " Happiness Score: " + Math.round(parseFloat(d.Happiness)*100)/100)
              .style("display", "inline");
          })
          .on("mouseout", function() {
            scatterplot.select('.tooltipText')
            .style("display", "none");
          });


    //add tooltip
    scatterplot.append("text")
        .attr('class', 'tooltipText')
        .attr("x", 0)
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .style("display", "none");

      // Pan and zoom
      var zoom = d3.zoom()
          .scaleExtent([.5, 20])
          .extent([[0, 0], [width, height]])
          .on("zoom", zoomed);


      function zoomed() {
          var new_xScale = d3.event.transform.rescaleX(x);
          var new_yScale = d3.event.transform.rescaleY(y);

          gX.call(xAxis.scale(new_xScale));
          gY.call(yAxis.scale(new_yScale));
          circles.attr("transform", d3.event.transform)
              .attr('cx', function(d) {return new_xScale(d.Gini)})
              .attr('cy', function(d) {return new_yScale(d.GDP/1000)});
      }

      zoom(scatterplot);
      darkLayer.style('visibility', 'visible');

  });
}
