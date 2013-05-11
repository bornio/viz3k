/**
 * This chart loads the character appearance data for this chapter and builds a chartNetworkForce from the nodes and
 * links returned from the server.
 */
function chartCoappear(elementId, dataFilePath, dataCallback)
{
  var nodes;
  var links;

  // read the json data
  d3.json(dataFilePath, function(json) {
    nodes = json.nodes;
    links = json.links;

    // each node should keep track of which other nodes it's linked to
    linkNodes(nodes, links);

    // return a copy of the nodes and links (use a copy to ensure they can be modified without affecting originals)
    dataCallback(nodes.slice(),links.slice());

    console.log("number of nodes:", nodes.length);
    console.log("number of links:", links.length);

    // create the d3 visualization(s)
    var viz = chartNetworkForce(elementId, nodes, links);
  });
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
