let width, clickedCountries;
let height = 1200;
let bColours =  ["#ff00bf", "#d3554b", "#d3294c", "#589428",
                "#6e6e71"];
let mColours = ["#efed37", "#ff8e0f", "#f2080d"];

let buttons = [{label: "Compare", class: "compare"},
                //{label: "Developed", class: "dev"},
                //{label: "Developing", class: "dev-ing"},
                //{label: "Underdeveloped", class: "undev"},
                {label: "Development Status", class: "dev-status"},
                {label: "Happiness Index", class: "happy"},
                {label: "Living Index", class: "livindex"},
                {label: "Reset", class: "reset"}];

var legend, hoverData, legendTitle;
var nullColour = '#ffffff';

var prevColour, prevCountry;
var firstime = true;

window.onload = function() {

width = document.body.clientWidth;
clickedCountries = [];
prevColours = [];
var nullC = ["AFG", "ATA", "BLZ", "BEN","BMU","BTN","BOL","BIH","BRN","BFA","BDI","CMR","CAF","TCD","CUB","COD","DJI","TLS","GNQ",
            "ERI","FLK","FJI","GUF","ATF","GAB","GMB","GRL","GIN","GNB","GUY","HTI","HND","CIV","KGZ","LAO","LSO","LBR","LBY","MDG",
            "MWI","MLI","MRT","MDA","MNE","MAR","MMR","NCL","NIC","NER","PRK","OMN",'PNG',"PRI","SRB","COG","SEN","SLE","SLB","SOM",
            "KOR","SSD","SDN","SUR","SWZ","SYR","TWN","TJK","BHS","TGO","TTO","TKM","TZA","VUT","VNM","PSE","ESH","YEM"];

  let svg = d3.select("svg")
    .attr('width', width)
    .attr('height', height)
    .style("background-color","#8cbdde");


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
      .domain([3 , 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5]) //10 Colours
      .range(['#ffffb9', '#ffe490', '#ffc773', '#ffa85f',
                '#f78c53', '#ea7049', '#da5640', '#c63d35',
                '#b02628', '#961017', '#7a0000']);

  const colorLiving = d3.scaleThreshold()
      .domain([20 , 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]) //12 Colours
      .range(['#d7d1b0', '#c1c586', '#9bbe4c', '#84b040',
                '#6da233', '#589428', '#43861d', '#2f7812',
                '#1b6a08', '#085b02', '#004d00']);

  // load data
  var worldmap = d3.json("countries.geojson");
  var countries = d3.csv("Data.csv");

  Promise.all([worldmap, countries]).then(function (values) {

    document.getElementById("searchForm").onsubmit = search;

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
        .attr('width', 210)
        .attr('rx', 6)
        .attr('ry', 6)
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style('cursor', 'pointer')
        .style("fill", (d, i) => {
          return bColours[i];
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
          .style('stroke-width', 3.5);

        addText(countryName(d), continentName(d));

        if (d.properties.livingIndex !== "") {
          tooltip.transition()
            .duration(100)
            .style("opacity", 0.9);

          tooltip.html(d.properties.name +  "<br />" + "Cost Living Index: " + d.properties.livingIndex +
              "<br />" + "Happiness Score: " + d.properties.happinessRank)
            .style("left", (d3.event.pageX) + "px")
            .style("font-size", "17px")
            .style("font-weight", "bold")
            .style("top", (d3.event.pageY - 28) + "px");
        }

        else {
            tooltip.transition()
                .duration(100)
                .style("opacity", .90);
            tooltip.html(d.properties.name)
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


    function clicked(d, i){
        if (clickedCountries.includes(d.id)) {
          d3.select(this)
              .style("fill", () => {
                return prevColours[clickedCountries.indexOf(d.id)];
              })
              .style("opacity", 0.6)
              .style('stroke-width', 0.5);
          var i = clickedCountries.indexOf(d.id);
          clickedCountries.splice(i, 1);
          prevColours.splice(i, 1);
        }
        else {
            if(nullC.includes(d.id))
                alert("No data for this country");
            else {
                prevColours.push(d3.select(this).style('fill'));
                d3.select(this)
                    .style("fill", "#ff00bf")
                    .style("opacity", 1.0).style('stroke', '#000000').style('stroke-width', 3);
                clickedCountries.push(d.id);
            }
        }
    }

    function search(e) {
      e.preventDefault();
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
          dPath.style('fill', "#ff00bf").style('opacity', 1).style('stroke', '#000000').style('stroke-width', 3);
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
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .style("opacity", 0.6);

    d3.selectAll('path').style('fill', bColours[4]);

    function filterMap(button, index) {
      if (button.class !== "compare") {
        d3.selectAll('path').style('fill', bColours[4]).style('opacity', 0.6).style("stroke-width", 0.5);
        clickedCountries = [];
      }
      if (button.class === "dev-status") {
        svg.selectAll('.Developed').style('fill', mColours[0]);
        svg.selectAll('.Developing').style('fill', mColours[1]);
        svg.selectAll('.Underdeveloped').style('fill', mColours[2]);
      }
      // else if (button.class === "dev-ing") {
      //   svg.selectAll(".Developing").style('fill', colours[index]);
      // }
      // else if (button.class === "undev") {
      //   svg.selectAll(".Underdeveloped").style('fill', colours[index]);
      // }
      else if (button.class === "happy") {
        d3.selectAll("path").style('fill', (d) => {
           if(d.properties.happinessRank == 0 || d.properties.livingIndex == 0)
               return nullColour;
            else
               return colorHappy(d.properties.happinessRank);
        });
      }
      else if (button.class === "livindex") {
        d3.selectAll("path").style('fill', function (d) {
            if(d.properties.livingIndex == 0)
                return nullColour;
            else
                return colorLiving(d.properties.livingIndex);
        });
      }

      else if(button.class === "compare"){
        showScatterplot(clickedCountries);
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
        .attr("y", 430)
        .attr("width", 24)
        .attr("height", 24)
        .style("fill", colorHappy);

    // draw legend text
    legend.append("text").attr("class", "text1")
        .attr("x", width - 24)
        .attr("y", 438)
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
        .text("Cost of Living Index");

      //legend title happiness
    var legendTitle1 = g.append("text").attr("class", "text2")
        .attr("x", width - 30)
        .attr("y", 390)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("Happiness Score");

    svg.append('g')
      .attr('class', 'scatter')
      .style('visibility', 'hidden')
      .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'black')
        .style('opacity', 0.8);

    });
}
