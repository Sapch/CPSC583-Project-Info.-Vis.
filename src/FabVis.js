let width;
let height = 1200;
let colours =  ["#efed37", "#ff8e0f", "#f2080d", "#ef3ccf",
                "#a02006", "#54f04c"];
let buttons = [{label: "Developed", width: 120, class: "dev"},
                {label: "Developing", width: 130, class: "dev-ing"},
                {label: "Underdeveloped", width: 180, class: "undev"},
                {label: "Happiness", width: 125, class: "happy"},
                {label: "Living Index", width: 150, class: "livindex"},
                {label: "Reset", width: 80, class: "reset"}];
var legend, hoverData, legendTitle;


window.onload = function() {

width = document.body.clientWidth;

  let svg = d3.select("svg")
    .attr('width', width)
    .attr('height', height)
    .style("background-color","#182aa5");

  var projection = d3.geoMercator().translate([width/2.1, height-(height/3)]).scale(width/9);
  var path = d3.geoPath().projection(projection);
  var g = svg.append('g');
  var centered;

  var bigText = g.append('text')
      .attr('x', 20)
      .attr('y', 50);

  var bigText1 = g.append('text')
      .attr('x', 20)
      .attr('y', 100);

  var mapLayer = g.append('g')
      .classed('map-layer', true);

  var colorScale = d3.scaleThreshold()
      .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
      .range(d3.schemeGreens[7]);

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  var data = d3.map();

  const colorHappy = d3.scaleThreshold()
      .domain([3.4,3.5,3.6,3.7
              ,3.8,3.9,4.0,4.1
              ,4.2,4.3,4.4,4.5
              ,4.6,4.7,4.8,4.9
              ,5.0,5.1,5.2,5.3
              ,5.4,5.5,5.6,5.7
              ,5.8,5.9,6.0,6.1
              ,6.2,6.3,6.4,6.5
              ,6.6,6.7,6.8,6.9
              ,7.0,7.1,7.2,7.3
              ,7.4,7.5,7.6]) //15
      .range(['#ffffe0', '#fff9db', '#fff3d7', '#ffecd2',
              '#ffe6cd', '#ffe0c9', '#ffdac4', '#ffd3bf',
              '#ffcdba', '#ffc6b6', '#ffc0b1', '#ffb9ac',
              '#ffb3a7', '#ffaca3', '#ffa59e', '#ff9e99',
              '#fe9794', '#fd9190', '#fb8a8c', '#f98488',
              '#f67e83', '#f4777f', '#f1717b', '#ee6b77',
              '#eb6574', '#e85e70', '#e5586c', '#e15268',
              '#dd4c65', '#da4661', '#d5405e', '#d13a5a',
              '#cd3357', '#c82d54', '#c32750', '#be214d',
              '#b81b4a', '#b31547', '#ad0e44', '#a70842',
              '#a1043f', '#9a013c', '#93003a']);

  const colorLiving = d3.scaleThreshold()
      .domain([30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110]) //17
      .range(['#ffef6d', '#f9e166', '#f4d45e', '#efc757',
              '#e9ba50', '#e3ad48', '#dda041', '#d7933a',
              '#d18633', '#ca792d', '#c46b26', '#bd5e1f',
              '#b65019', '#af4212', '#a8320c', '#a02006',
              '#980001']);


  // load data
  var worldmap = d3.json("countries.geojson");
  var countries = d3.csv("Data.csv");


  Promise.all([worldmap, countries]).then(function (values) {

    svg.selectAll('.button')
      .data(buttons)
      .enter()
      .append('rect')
        .attr('class', d => 'button-'+d.class)
        .attr('x', 30)
        .attr('y', (d, i) => {
          return (i*50) + 800;
        })
        .attr('height', 40)
        .attr('width', d => d.width)
        .attr('rx', 6)
        .attr('ry', 6)
        .style('cursor', 'pointer')
        .style("fill", (d, i) => {
          return colours[i];
        } )
        .on("mouseover", (d) => {
          svg.select('.button-'+d.class)
            .style('opacity', 0.5)
        })
        .on("mouseleave", (d) => {
          svg.select('.button-'+d.class)
            .style('opacity', 1.0);
        })
        .on('click', (d, i) => {
          filterMap(d, i);
        });

    svg.selectAll('.button')
      .data(buttons)
      .enter()
      .append('text')
        .attr('x', 40)
        .attr('y', (d, i) => {
          return (i*50) + 825;
        })
        .attr("font-size", '22px')
        .style("font-weight", "bold")
        .style('cursor', 'pointer')
        .text(d => d.label)
        .on("mouseover", (d) => {
          svg.select('.button-'+d.class)
            .style('opacity', 0.5)
        })
        .on("mouseleave", (d) => {
          svg.select('.button-'+d.class)
            .style('opacity', 1.0);
        })
        .on('click', (d, i) => {
          filterMap(d, i);
        });


    function countryName(d) {
        return d && d.properties ? d.properties.name : null;
    }

    function continentName(d) {
        return d && d.properties ? d.properties.continent : null;
    }

    function developmentStatus(d) {
        return d && d.properties ? d.properties.developStatus : null;
    }


    function mouseOver(d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", 10)
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "black")

        addText(countryName(d), continentName(d));

        if (d.properties.livingIndex !== "") {
          tooltip.transition()
            .duration(200)
            .style("opacity", .90);

          tooltip.html("Cost Living Index: " + d.properties.livingIndex + "\n" + "Happiness Score: " + d.properties.happinessRank)
            .style("left", (d3.event.pageX) + "px")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .style("top", (d3.event.pageY - 28) + "px");
        }
    }


    function mouseLeave(d) {
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", 0.7)
      d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
        .style("opacity", 0.7)

      //Clear province name
      bigText.text('');
      bigText1.text('');
     //remove tooltip
      tooltip.transition()
        .duration(1000)
        .style("opacity", 0);
    }

    // draw map
    svg.selectAll("path")
      .data(values[0].features)
      .enter()
      .append("path")
        .attr("class", "continent")
        .attr("d", path)
        .attr("fill", function (d) {
          if (developmentStatus(d) == "Developed") {
            //d3.select(this).style('fill', colours[0]);
            d3.select(this).classed("Developed", true)
          }
          if (developmentStatus(d) == "Developing") {
            //d3.select(this).style('fill', colours[1]);
            d3.select(this).classed("Developing", true)
          }
          if (developmentStatus(d) == "Underdeveloped") {
            //d3.select(this).style('fill', colours[2]);
            d3.select(this).classed("Underdeveloped", true)
          }

        })
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .style("stroke", "transparent")
        .style("opacity", 0.7);


    d3.selectAll('path').style('fill', colours[5]);

    function filterMap(button, index) {
      d3.selectAll('path').style('fill', colours[5]);
      if (button.class === "dev") {
        svg.selectAll('.Developed').style('fill', colours[index]);
      }
      else if (button.class === "dev-ing") {
        svg.selectAll(".Developing").style('fill', colours[index]);
      }
      else if (button.class === "undev") {
        svg.selectAll(".Underdeveloped").style('fill', colours[index]);
      }
      else if (button.class === "happy") {
        d3.selectAll("path").style('fill', (d) => {
            return colorHappy(d.properties.happinessRank);
        });
      }
      else if (button.class === "livindex") {
        d3.selectAll("path").style('fill', function (d) {
            return colorLiving(d.properties.livingIndex);
        });
      }
    }


    function addText(text, text1) {
        bigText
            .style('font-family', "Arial")
            .classed('bigText', true)
            .text(text);

        bigText1
            .style('font-family', "Arial")
            .classed('bigText', true)
            .text(text1);
    }


    // draw legend
    var legend = svg.selectAll(".legend")
        .data(colorHappy.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(-200," + i * 26 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("y", 40)
        .attr("width", 24)
        .attr("height", 24)
        .style("fill", colorHappy);

    // draw legend text
    legend.append("text").attr("class", "text1")
        .attr("x", width - 24)
        .attr("y", 52)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})

    // draw legend
    var legend1 = svg.selectAll(".legend1")
        .data(colorLiving.domain())
        .enter().append("g")
        .attr("class", "legend1")
        .attr("transform", function(d, i) { return "translate(-100," + i * 26 + ")"; });

    // draw legend colored rectangles
    legend1.append("rect")
        .attr("x", width - 18)
        .attr("y", 40)
        .attr("width", 24)
        .attr("height", 24)
        .style("fill", colorLiving);

    // draw legend text
    legend1.append("text").attr("class", "text1")
        .attr("x", width - 24)
        .attr("y", 52)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})

    var legendTitle = g.append("text").attr("class", "text2")
        .attr("x", width - 140)
        .attr("y", 16)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text("Living Index")

    var legendTitle1 = g.append("text").attr("class", "text2")
        .attr("x", width - 340)
        .attr("y", 16)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text("Happiness Score")

    });
}
