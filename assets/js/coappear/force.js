function appear_force(data_nodes, data_links, coappear_ids)
{
  var chartArea = document.getElementById("chart-area");
  var width = 800, height = 720;
  var force = d3.layout.force().charge(-800).linkDistance(180).gravity(0.4).size([width, height]);
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
      .attr("r", function(d) { return 32*Math.sqrt(d.links/max_links) + 2; })
      .style("fill", function(d) { return d3.rgb(d.color); })

  var texts = g_texts.append("text")
      .attr("class", "node")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(function(d) { return d.name })
      .attr("font-size", function(d) { return (String(18*(d.links/max_links) + 10) + "px")})
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

function appear_stack(characters, graph)
{
  // style
  var bar_height = 22;
  var bar_width = 24;
  var label_size = "13px";
  var height = bar_height * characters.length;

  var svg = d3.select("#stack").append("svg").attr("height", height);
  
  // get baselines
  var baselines = new Array(characters.length);
  for (i = 0; i < characters.length; i++)
  {
    baselines[i] = i*bar_height;
  }

  // use an svg:g element to group each bar with its associated text label
  var stack_items = svg.append("g").selectAll("g")
      .data(characters).enter().append("g")
      .attr("class","stack_item")
      .attr("transform", function(d, i) { return "translate(" + 0 + "," + baselines[i] + ")"; });

  // create an area to be used for each data bar and its associated text label
  var bar_areas = stack_items.append("rect").attr("class","stack_bar_area")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", function(d) { return bar_height; })
    .style("fill", "#ffffff")
    .style("opacity", 0.0);

  // create the colored bars, one for each element of data
  var bars = stack_items.append("rect").attr("class","stack_bar")
    .attr("x", bar_width*0.25)
    .attr("y", 0)
    .attr("width", bar_width)
    .attr("height", function(d) { return bar_height; })
    .style("fill", function(d, i) { return d3.rgb(d.color); });

  // create text labels for each bar
  var bar_texts = stack_items.append("text").attr("class","stack")
    .attr("x", bar_width*1.75)
    .attr("y", function(d) { return bar_height/2; })
    .attr("dominant-baseline", "central")
    .text(function(d) { return d.name })
    .attr("font-size", label_size);

  // set mouseover and mouseout events for each bar area and the bars themselves
  function stack_mouseover(node, node_index)
  {
    // highlight this person's bar in the stack
    bar_areas.filter(function(d) { return (d.id == node.id) ? this : null; })
      .style("fill", "#aaeeff")
      .style("opacity", 1.0);

    // highlight this person's circle in the graph
    graph.highlight_i(node, node_index);
  }

  function stack_mouseout(node, node_index)
  {
    // unhighlight this person's bar in the stack
    bar_areas.filter(function(d) { return (d.id == node.id) ? this : null; })
      .style("opacity", 0.0);

    // unhighlight this person's circle in the graph
    graph.highlight_o(node, node_index);
  }

  stack_items.on("mouseover", function(d, i) { stack_mouseover(d, i); });
  stack_items.on("mouseout", function(d, i) { stack_mouseout(d, i); });
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

  // render the character stack
  var stack = appear_stack(nodes, graph);

  return { graph : graph, stack : stack };
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
    data_callback(nodes,links);

    console.log("number of nodes:", nodes.length);
    console.log("number of links:", links.length);

    var coappear_resize = function()
    {
      chart.style.width = "800px";
      chart.style.height = "720px";
    }

    // set initial size
    coappear_resize();

    // create the d3 visualization(s)
    var viz = coappear_draw(nodes, links);

    window.addEventListener("resize", coappear_resize, false);
  });
}
