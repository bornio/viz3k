/**
 * This chart loads the character appearance data for this chapter and builds a chart_network_force from the nodes and
 * links returned from the server.
 */
function chart_coappear(element_id, data_file_path, data_callback)
{
  var nodes;
  var links;

  // read the json data
  d3.json(data_file_path, function(json)
  {
    nodes = json.nodes;
    links = json.links;

    // each node should keep track of which other nodes it's linked to
    link_nodes(nodes, links);

    // return a copy of the nodes and links (use a copy to ensure they can be modified without affecting originals)
    data_callback(nodes.slice(),links.slice());

    console.log("number of nodes:", nodes.length);
    console.log("number of links:", links.length);

    // create the d3 visualization(s)
    var viz = chart_network_force(element_id, nodes, links);
  });
}

function link_nodes(nodes, links)
{
  for (n = 0; n < nodes.length; n++)
  {
    nodes[n].linked = new Array();
    for (l = 0; l < links.length; l++)
    { 
      if (links[l].source == n)
      {
        nodes[n].linked.push(links[l].target);
      }
      else if (links[l].target == n)
      {
        nodes[n].linked.push(links[l].source);
      }
    }
  }
}

function nodes_sort_by_links(nodes)
{
  // sort the characters by decreasing number of links
  var sorted = nodes.slice();
  sorted.sort(function(a,b)
  {
    // use alphabetical name sorting as tie-breaker
    if (b.links == a.links)
    {
      if (a.name < b.name)
      {
        return -1;
      }
      else if (a.name > b.name)
      {
        return 1;
      }
      return 0;          
    }

    return b.links - a.links;
  });
  return sorted;
}
