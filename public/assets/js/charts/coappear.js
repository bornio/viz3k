/**
 * This chart displays the character appearance data for this chapter as a chartNetworkForce using the nodes and links
 * returned from the server.
 */
function chartCoappear(elementId, coappear)
{
  var nodes;
  var links;

  // make a copy of the data so we can modify it
  nodes = coappear.nodes.slice();
  links = coappear.links.slice();

  // each node should keep track of which other nodes it's linked to
  linkNodes(nodes, links);

  console.log("number of nodes:", nodes.length);
  console.log("number of links:", links.length);

  // create the d3 visualization(s)
  var viz = chartNetworkForce()
    .data({nodes: nodes, links: links})
    .render(elementId);
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
