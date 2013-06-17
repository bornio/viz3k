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

    // each node should keep track of which other nodes it's linked to
    linkNodes(data.nodes, data.links);

    console.log("number of nodes:", data.nodes.length);
    console.log("number of links:", data.links.length);

    return chart;
  };

  // render the chart
  chart.render = function(elementId) {
    chartNetworkForce()
      .data(data)
      .render(elementId);

    return chart;
  };
  
  return chart;
}

function linkNodes(nodes, links) {
  for (var n = 0; n < nodes.length; n++) {
    nodes[n].linked = new Array();
    for (var l = 0; l < links.length; l++) { 
      if (links[l].source == n) {
        nodes[n].linked.push(links[l].target);
      } else if (links[l].target == n) {
        nodes[n].linked.push(links[l].source);
      }
    }
  }
}

function sortNodesByLinks(nodes) {
  // sort the characters by decreasing number of links
  var sorted = nodes.slice();
  sorted.sort(function(a,b) {
    // use alphabetical name sorting as tie-breaker
    if (b.links == a.links) {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;          
    }

    return b.links - a.links;
  });
  return sorted;
}
