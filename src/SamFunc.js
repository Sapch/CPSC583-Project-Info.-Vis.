
function showScatterplot(clickedCountries) {

let width = document.body.clientWidth, height = 1200;
let darkLayer = d3.select('.scatter');

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

darkLayer.style('visibility', 'visible');

  /*
  d3.csv("/SamData.csv").then( function(data) {

    data = data.filter((d) => {
      return clickedCountries.includes(d.id);
    })


  });*/
}
