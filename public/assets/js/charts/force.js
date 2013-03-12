function appear_force(data_nodes, data_links, coappear_ids)
{
  var chartArea = document.getElementById("chart-area");
  var width = 680, height = 680;
  var force = d3.layout.force().charge(-700).linkDistance(160).gravity(0.5).size([width, height]);
  var svg = d3.select("#chart").append("svg");
  
  var viewbox_size = "0 0 " + String(width) + " " + String(height);
  svg.attr("viewBox", viewbox_size).attr("width", "100%").attr("height", "100%");

  // standard colors
  var circle_color_faded = "#cccccc";
  var text_color = "#000000";
  var text_color_faded = "#aaaaaa";
  var text_color_interpol = d3.interpolateRgb(text_color_faded, text_color);

  force
      .nodes(data_nodes)
      .links(data_links)
      .start();

  var links = svg.selectAll("line.link")
      .data(data_links)
      .enter().append("line")
      .attr("class", "link");

  var nodes = svg.selectAll("g")
      .data(data_nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  var circles = nodes.append("circle")
      .attr("class", "node")

  var g_texts = svg.append("g").selectAll("g")
      .data(force.nodes())
      .enter().append("g");

  // scale all links relative to highest-value link
  var max_link_value = 1;
  links.each(function(d) { if (d.value > max_link_value) { max_link_value = d.value; } })
  var max_line_w = (max_link_value < 7) ? max_link_value : 7;
  var min_line_w = 1;
  var line_w_range = max_line_w - min_line_w;
  var line_w_factor = (max_link_value > 1) ? line_w_range/(max_link_value - 1) : 0;
  links.style("stroke-width", function(d) { return (d.value - 1)*line_w_factor + min_line_w; })
    .style("stroke-opacity", function(d) { return (max_link_value > 1) ? 0.8*((d.value - 1)/(max_link_value - 1)) + 0.2 : 1; });

  // scale all circles and text labels relative to most heavily-linked node
  var max_links = 0.0;
  g_texts.each(function(d) { if (d.links > max_links) { max_links = d.links; } })

  circles
      .attr("r", function(d) { return 24*Math.sqrt(d.links/max_links) + 2; })
      .style("fill", function(d) { return d3.rgb(d.color); })

  var texts = g_texts.append("text")
      .attr("class", "node")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(function(d) { return d.name })
      .attr("font-size", function(d) { return (String(12*(d.links/max_links) + 9) + "px")})
      .style("color", text_color)
      .attr("stroke-width", function(d) { return (String(1.2*(d.links/max_links) + 0.2) + "px")});

  force.on("tick", function()
  {
    links.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    g_texts.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });

  // returns true if a node is directly connected to another node by a link
  var connected_node = function(i, other_i)
  {
    return (coappear_ids[i].indexOf(other_i) >= 0) ? true : false;
  }

  // functions to highlight characters on mouseover and mouseout
  // note that these are made accessible to other events as well, outside the graph
  var highlight_i = function(node, node_index)
  {
    // partly gray out nodes that are directly linked to this one
    circles.filter(function(d, i) { return connected_node(node_index, i) ? this : null; })
      .style("fill", function(d) { color = d3.interpolateRgb(circle_color_faded, d.color); return color(0.3); });
    texts.filter(function(d, i) { return connected_node(node_index, i) ? this : null; })
      .style("fill", text_color_interpol(0.3));

    // fully gray out all other nodes in the graph
    circles.filter(function(d, i) { return (!connected_node(node_index, i) && (d.id != node.id)) ? this : null; })
      .style("fill", circle_color_faded);
    texts.filter(function(d, i) { return (!connected_node(node_index, i) && (d.id != node.id)) ? this : null; })
      .style("fill", text_color_faded);

    // reduce opacity of all links that do not have this node as a source or target
    links.filter(function(d) { return (d.source.id != node.id && d.target.id != node.id) ? this : null; })
      .style("stroke-opacity", 0.1);

    // maximize opacity of all links in or out of this node
    links.filter(function(d) { return (d.source.id == node.id || d.target.id == node.id) ? this : null; })
      .style("stroke-opacity", 1);
  }

  var highlight_o = function(node, node_index)
  {
    // return all graph circles to their standard styles
    circles.style("fill", function(d) { return d3.rgb(d.color); });

    // return all graph texts to their standard styles
    texts.style("fill", text_color);

    // restore opacity of all links
    links.style("stroke-opacity", function(d) { return (max_link_value > 1) ? 0.8*((d.value - 1)/(max_link_value - 1)) + 0.2 : 1; });
  }

  circles.on("mouseover", function(d, i) { highlight_i(d, i); });
  circles.on("mouseout", function(d, i) { highlight_o(d, i); });

  return {
    force : force,
    nodes : nodes,
    links : links,
    circles : circles,
    texts : texts,
    highlight_i : highlight_i,
    highlight_o : highlight_o
  };
}

function get_coappearances(nodes, links)
{
  var coappear_ids = new Array(nodes.length);
  for (n = 0; n < nodes.length; n++)
  {
    coappear_ids[n] = new Array();
    for (l = 0; l < links.length; l++)
    { 
      if (links[l].source == n)
      {
        coappear_ids[n].push(links[l].target);
      }
      else if (links[l].target == n)
      {
        coappear_ids[n].push(links[l].source);
      }
    }
  }

  return coappear_ids;
}

function coappear_draw(nodes, links)
{
  // create a data structure to remember which nodes are connected to which others
  var coappear_ids = get_coappearances(nodes, links);

  // render the coappearance graph
  var graph = appear_force(nodes, links, coappear_ids);

  return { graph : graph };
}

function coappear(data_file_path, data_callback)
{
  var nodes;
  var links;

  // read the json data
  d3.json(data_file_path, function(json)
  {
    nodes = json.nodes;
    links = json.links;

    // return a copy of the nodes and links (use a copy to ensure they can be modified without affecting originals)
    data_callback(nodes.slice(),links.slice());

    console.log("number of nodes:", nodes.length);
    console.log("number of links:", links.length);

    var coappear_resize = function()
    {
      chart.style.width = "680px";
      chart.style.height = "680px";
    }

    // set initial size
    coappear_resize();

    // create the d3 visualization(s)
    var viz = coappear_draw(nodes, links);

    window.addEventListener("resize", coappear_resize, false);
  });
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
