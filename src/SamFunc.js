
function showScatterplot(clickedCountries) {

  let width = document.body.clientWidth, height = 1200,
    margin = {top: 100, right: (width-1400)/2, bottom: 100, left: (width-1400)/2},
    keys = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"],
    darkLayer = d3.select('.scatter');

  let scatterplot = darkLayer.append('g').attr('class', 'secondVis');

  scatterplot.append('rect')
      .attr('x', width/2 - 800)
      .attr('y', 100)
      .attr('width', 1600)
      .attr('height', 1000)
      .attr('rx', 12)
      .attr('ry', 12)
      .style('fill', 'white');

  scatterplot.append('text')
      .attr('x', width/2 + 760)
      .attr('y', 140)
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
    })

    // Add X axis
    var x = d3.scaleLinear()
        .domain([20, 65])
        .rangeRound([ margin.left, width-margin.right ]);

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([3, 8.5])
        .rangeRound([ height-margin.bottom-100, margin.top+100]);

    // Add a scale for bubble size
    var z = d3.scaleLinear()
        .domain([0, 140000])
        .rangeRound([5, 60]);

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal(d3.schemeSet1);

    //add x axis to scatterplot
    scatterplot.append("g")
        .attr("transform", "translate(0," + (height-margin.bottom-100) + ")")
        .call(d3.axisBottom().scale(x))
        .attr("font-size", 18)
        .append("text")
          .attr("y", 80)
          .attr("x", width/2)
          .attr("fill", "#000")
          .attr("font-size", 30)
          .attr("font-weight", "bold")
          .attr("text-anchor", "middle")
          .text("Gini Coefficient (economic inequality)");

    //add y axis to scatterplot
    scatterplot.append("g")
    .attr("transform", 'translate('+margin.left+',0)')
    .call(d3.axisLeft().scale(y))
    .attr("font-size", 18)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr('x', -height/2)
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("font-size", 30)
      .attr("text-anchor", "middle")
      .text("Happiness Score");

    //legend rectangles
    var size = 30
    scatterplot.selectAll('legend')
        .data(keys)
        .enter()
        .append("rect")
          .attr("x", width/2 + 600)
          .attr("y", function(d,i){
            console.log(i);
            return 150 + i*(size+5);
          })
          .attr("width", size)
          .attr("height", size)
          .style("fill", function(d, i){
            //console.log(i);
            return myColor(d);
          });

    //legend labels
    scatterplot.selectAll('label')
        .data(keys)
        .enter()
        .append("text")
          .attr("x", width/2 + 640)
          .attr("y", function(d,i){
            return 170 + i*(size+5);})
          .text(function(d){
            return d;})
          .style("fill", "#000")
          .attr("font-size", 22)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold");

    // Add dots
    scatterplot.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d.Gini); } )
          .attr("cy", function (d) { return y(d.Happiness); } )
          .attr("r", function (d) { return z(d.GDP); } )
          .style("fill", function (d) { return myColor(d.Continent); } )
          .style("opacity", "0.7")
          .attr("stroke", "black")
          .style("stroke-width", "2px")
          .on("mouseover", function(d) {
            var xPosition = d3.mouse(this)[0];
            var yPosition = d3.mouse(this)[1]-20;

            scatterplot.select('.tooltipText')
              .attr("x", xPosition)
              .attr("y", yPosition)
              .text(d.Country + " $"+ d.GDP/1000+"K")
              .style("display", "inline");
          })
          .on("mousemove", function(d) {

          })
          .on("mouseout", function() { scatterplot.select('.tooltipText').style("display", "none"); });

    //add tooltip
    scatterplot.append("text")
        .attr('class', 'tooltipText')
        .attr("x", 0)
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .style("display", "none");

    darkLayer.style('visibility', 'visible');

  });
}
