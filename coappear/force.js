function appear_force(data_nodes, data_links)
{
  var width = 1024, height = 800;
  var force = d3.layout.force().charge(-800).linkDistance(180).gravity(0.2).size([width, height]);
  var svg = d3.select("#chart").append("svg");

  var viewbox_size = "0 0 " + String(width) + " " + String(height);
  svg.attr("viewBox", viewbox_size).attr("width", "100%").attr("height", "96%");

  force
      .nodes(data_nodes)
      .links(data_links)
      .start();

  var links = svg.selectAll("line.link")
      .data(data_links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return 0.5*Math.sqrt(d.value); });

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
      .attr("font-size", function(d) { return (String(20*(d.links/max_links) + 12) + "px")})
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

  // functions to highlight characters on mouseover and mouseout
  // note that these are made accessible to other events as well, outside the graph
  var circles_highlight_in = function(d_mouse)
  {
    // gray out all other circles in the graph
    circles.filter(function(d) { return (d.id != d_mouse.id) ? this : null; })
      .transition()
      .style("fill", "#cccccc");

    // gray out all other texts in the graph
    texts.filter(function(d) { return (d.id != d_mouse.id) ? this : null; })
      .transition()
      .style("fill", "#aaaaaa");
  }

  var circles_highlight_out = function(d_mouse)
  {
    // return graph circles to their standard styles
    circles.filter(function(d) { return (d.id != d_mouse.id) ? this : null; })
      .transition()
      .style("fill", function(d) { return d3.rgb(d.color); });

    // return graph texts to their standard styles
    texts.filter(function(d) { return (d.id != d_mouse.id) ? this : null; })
      .transition()
      .style("fill", "#000000");
  }

  circles.on("mouseover", function(d) { circles_highlight_in(d); });
  circles.on("mouseout", function(d) { circles_highlight_out(d); });

  return {
    force : force,
    nodes : nodes,
    links : links,
    circles : circles,
    texts : texts,
    circles_highlight_in : circles_highlight_in,
    circles_highlight_out : circles_highlight_out
  };
}

function appear_stack(characters, graph)
{
  // style
  var width = 256;
  var bar_height = 30;
  var bar_width = width / 10;
  var bar_text_width = width - (bar_width * 1.5);
  var label_size = "13px";
  var height = bar_height * characters.length;

  var svg = d3.select("#stack").append("svg").attr("width", width).attr("height", height);
  
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
    .attr("width", width)
    .attr("height", function(d) { return bar_height; })
    .style("fill", "#ffffff")
    .style("opacity", 0.0);

  // create the colored bars, one for each element of data
  var bars = stack_items.append("rect").attr("class","stack_bar")
    .attr("x", bar_width/2)
    .attr("y", 0)
    .attr("width", bar_width)
    .attr("height", function(d) { return bar_height; })
    .style("fill", function(d, i) { return d3.rgb(d.color); });

  // create text labels for each bar
  var bar_texts = stack_items.append("text").attr("class","stack")
    .attr("x", bar_width*2)
    .attr("y", function(d) { return bar_height/2; })
    .attr("dominant-baseline", "central")
    .text(function(d) { return d.name })
    .attr("font-size", label_size);

  // set mouseover and mouseout events for each bar area and the bars themselves
  function stack_mouseover(d_mouse)
  {
    // highlight this person's bar in the stack
    bar_areas.filter(function(d) { return (d.id == d_mouse.id) ? this : null; })
      .style("fill", "#aaeeff")
      .style("opacity", 1.0);

    // highlight this person's circle in the graph
    graph.circles_highlight_in(d_mouse);
  }

  function stack_mouseout(d_mouse)
  {
    // unhighlight this person's bar in the stack
    bar_areas.filter(function(d) { return (d.id == d_mouse.id) ? this : null; })
      .style("opacity", 0.0);

    // unhighlight this person's circle in the graph
    graph.circles_highlight_out(d_mouse);
  }

  stack_items.on("mouseover", function(d) { stack_mouseover(d); });
  stack_items.on("mouseout", function(d) { stack_mouseout(d); });
}

function coappear_draw(nodes, links)
{
  // render the coappearance graph
  var graph = appear_force(nodes, links);

  // render the character stack
  var stack = appear_stack(nodes, graph);

  return { graph : graph, stack : stack };
}

function coappear(data_file_path)
{
  var nodes;
  var links;

  // read the json data
  d3.json(data_file_path, function(json)
  {
    nodes = json.nodes;
    links = json.links;

    console.log("number of nodes:", nodes.length);
    console.log("number of links:", links.length);

    // create the d3 visualization(s)
    var viz = coappear_draw(nodes, links);
  });
}
