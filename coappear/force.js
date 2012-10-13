function appear_force(nodes, links)
{
  var width = 1024, height = 1024;
  var force = d3.layout.force().charge(-360).linkDistance(200).size([width, height]);
  var svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);

  force
      .nodes(nodes)
      .links(links)
      .start();

  var link = svg.selectAll("line.link")
      .data(links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return 0.5*Math.sqrt(d.value); });

  var node = svg.selectAll("circle.node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  var circle = node.append("circle")
      .attr("class", "node")

  var text = svg.append("g").selectAll("g")
      .data(force.nodes())
      .enter().append("g");

  // scale all circles and text labels relative to most heavily-linked node
  var max_links = 0.0;
  text.each(function(d) { if (d.links > max_links) { max_links = d.links; } })

  circle
      .attr("r", function(d) { return 20*Math.sqrt(d.links/max_links) + 2; })
      .style("fill", function(d) { return d3.rgb(d.color); })

  text.append("text")
      .attr("class", "node")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(function(d) { return d.name })
      .attr("font-size", function(d) { return (String(20*(d.links/max_links) + 8) + "px")})
      .attr("stroke-width", function(d) { return (String(d.links/max_links) + "px")});

  force.on("tick", function()
  {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
}

function appear_stack(characters)
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
  function stack_mouseover(i_mouse)
  {
    bar_areas.filter(function(d, i) { return (i == i_mouse) ? this : null; })
      .style("fill", "#aaeeff")
      .style("opacity", 1.0);
  }

  function stack_mouseout(i_mouse)
  {
    bar_areas.filter(function(d, i) { return (i == i_mouse) ? this : null; })
      .style("opacity", 0.0);
  }

  stack_items.on("mouseover", function(d, i) { stack_mouseover(i); });
  stack_items.on("mouseout", function(d, i) { stack_mouseout(i); });
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

    // render the coappearance graph
    appear_force(nodes, links);

    // render the character stack
    appear_stack(nodes);
  });
}
