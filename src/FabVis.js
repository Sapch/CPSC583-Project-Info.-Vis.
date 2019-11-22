let width, clickedCountries;
let height = 1200;
let colours =  ["#efed37", "#ff8e0f", "#f2080d", "#00efff",
                "#ee7497", "#54f04c"];
let buttons = [{label: "Developed", class: "dev"},
                {label: "Developing", class: "dev-ing"},
                {label: "Underdeveloped", class: "undev"},
                {label: "Happiness Index", class: "happy"},
                {label: "Living Index", class: "livindex"},
                {label: "Reset", class: "reset"}];
var legend, hoverData, legendTitle;

var prevColour, prevCountry;
var firstime = true;

window.onload = function() {

width = document.body.clientWidth;
clickedCountries = [];
prevColours = [];

  let svg = d3.select("svg")
    .attr('width', width)
    .attr('height', height)
    .style("background-color","#edfeff");


  var projection = d3.geoMercator().translate([width/2.1, height-(height/3)]).scale(width/11);
  var path = d3.geoPath().projection(projection);
  var g = svg.append('g');

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
      .domain([3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5]) //10 Colours
      .range(['#001225', '#042739', '#073c4f', '#0a5366',
            '#0c6b7e', '#0d8496', '#0d9daf', '#0bb8c9',
            '#07d3e4', '#00efff']);

  const colorLiving = d3.scaleThreshold()
      .domain([30, 40, 50, 60, 70, 80, 90, 100, 110, 120]) //10 Colours
      .range(['#fd82ab', '#ee7497', '#df6783', '#d05970',
                '#c14c5d', '#b13e4b', '#a23139', '#922328',
                '#821417', '#730003']);


  // load data
  var worldmap = d3.json("countries.geojson");
  var countries = d3.csv("Data.csv");

  Promise.all([worldmap, countries]).then(function (values) {

    var searchbtn = document.getElementById("searchBtn");
    searchbtn.onclick = search;

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
        .attr('width', 180)
        .attr('rx', 6)
        .attr('ry', 6)
        .style('cursor', 'pointer')
        .style("fill", (d, i) => {
          return colours[i];
        } )
        .on("mouseover", (d) => {
          svg.select('.button-'+d.class)
            .style('opacity', 1.0)
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
            .style('opacity', 1.0)
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
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style('stroke-width', 2.5);

        addText(countryName(d), continentName(d));

        if (d.properties.livingIndex !== "") {
          tooltip.transition()
            .duration(100)
            .style("opacity", .90);

          tooltip.html(d.properties.name +  "<br />" + "Cost Living Index: " + d.properties.livingIndex + "<br />" + "Happiness Score: " + d.properties.happinessRank)
            .style("left", (d3.event.pageX) + "px")
            .style("font-size", "17px")
            .style("font-weight", "bold")
            .style("top", (d3.event.pageY - 28) + "px");
        }
    }


    function mouseLeave() {
        svg.selectAll('path')
            .transition()
            .duration(200)
            .style("opacity", (d) => {
              if (clickedCountries.includes(d.id)) return 1.0;
              return 0.6;
            })
            .style('stroke-width', 0.5);
      //Clear province name
      bigText.text('');
      bigText1.text('');
     //remove tooltip
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    }


    function clicked(d){
        if (clickedCountries.includes(d.id)) {
          d3.select(this)
              .style("fill", () => {
                return prevColours[clickedCountries.indexOf(d.id)];
              })
              .style("opacity", 0.6);
          var i = clickedCountries.indexOf(d.id);
          clickedCountries.splice(i, 1);
          prevColours.splice(i, 1);
        }
        else {
          prevColours.push(d3.select(this).style('fill'));
          d3.select(this)
              .style("fill", "#ff00bf")
              .style("opacity", 1.0);
          clickedCountries.push(d.id);
        }
    }

    function search() {
      let countryName = document.getElementById("countryN").value.toLowerCase();
      let d = svg.selectAll('path')
        .filter((d) => {
          return d.properties.name.toLowerCase() === countryName;
        }).data();
      let dPath = svg.selectAll('path')
        .filter((d) => {
          return d.properties.name.toLowerCase() === countryName;
        });
      if (d.length > 0) {
        d = d[0];
        if (!clickedCountries.includes(d.id)) {
          clickedCountries.push(d.id);
          prevColours.push(dPath.style('fill'));
          dPath.style('fill', "#ff00bf").style('opacity', 1);
        }
      }
    }

    // draw map
    svg.selectAll("path")
      .data(values[0].features)
      .enter()
      .append("path")
        .attr("class", d => "continent-" + d.properties.name)
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
        .on("click", clicked)
        //.style("stroke", "transparent")
        .style("opacity", 0.6);

    d3.selectAll('path').style('fill', colours[5]);

    function filterMap(button, index) {
      d3.selectAll('path').style('fill', colours[5]).style('opacity', 0.6);
      clickedCountries = [];
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


      // draw legend Happiness
    var legend = svg.selectAll(".legend")
        .data(colorHappy.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(-120," + i * 26 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("y", 400)
        .attr("width", 24)
        .attr("height", 24)
        .style("fill", colorHappy);

    // draw legend text
    legend.append("text").attr("class", "text1")
        .attr("x", width - 24)
        .attr("y", 408)
        .attr("dy", ".65em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})

    // draw legend Cost living index
    var legend1 = svg.selectAll(".legend1")
        .data(colorLiving.domain())
        .enter().append("g")
        .attr("class", "legend1")
        .attr("transform", function(d, i) { return "translate(-120," + i * 26 + ")"; });

    // draw legend colored rectangles
    legend1.append("rect")
        .attr("x", width - 18)
        .attr("y", 50)
        .attr("width", 24)
        .attr("height", 24)
        .style("fill", colorLiving);

    // draw legend text
    legend1.append("text").attr("class", "text1")
        .attr("x", width - 24)
        .attr("y", 64)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})


      //legend title cost of living
    var legendTitle = g.append("text").attr("class", "text2")
        .attr("x", width - 30)
        .attr("y", 16)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("Cost of Living Index")

      //legend title happiness
    var legendTitle1 = g.append("text").attr("class", "text2")
        .attr("x", width - 30)
        .attr("y", 370)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("Happiness Score")

    });
}
