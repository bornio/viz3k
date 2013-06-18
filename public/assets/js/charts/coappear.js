/**
 * This chart displays the character appearance data for this chapter as a chartNetworkForce using the nodes and links
 * returned from the server.
 */
function chartCoappear() {
  // default settings
  var data = {nodes: [], links: []};

  // the chart object that will be returned
  var chart = {};

  // expose getter/setters

  chart.data = function(value) {
    if (!arguments.length) return data;

    // make a copy of the data so we can modify it
    data.nodes = value.nodes.slice();
    data.links = value.links.slice();

    console.log("number of nodes:", data.nodes.length);
    console.log("number of links:", data.links.length);

    return chart;
  };

  // render the chart
  chart.render = function(elementId) {
    chartNetworkForce()
      .data(data)
      .width(750)
      .height(480)
      .render(elementId);

    return chart;
  };
  
  return chart;
}

function sortNodesByLinks(nodes) {
  // sort the characters by decreasing number of links
  var sorted = nodes.slice();
  sorted.sort(function(a,b) {
    // use alphabetical name sorting as tie-breaker
    if (b.degree == a.degree) {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;          
    }

    return b.degree - a.degree;
  });
  return sorted;
}
