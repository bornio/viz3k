function coappear(data_file_path)
{
  var width = 1280, height = 1024;
  var force = d3.layout.force().charge(-360).linkDistance(200).size([width, height]);
  var svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);

  d3.json(data_file_path, function(json)
  {
    force
        .nodes(json.nodes)
        .links(json.links)
        .start();

    var link = svg.selectAll("line.link")
        .data(json.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return 0.5*Math.sqrt(d.value); });

    var node = svg.selectAll("circle.node")
        .data(json.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    var circle = node.append("circle")
        .attr("class", "node")

    var text = svg.append("svg:g").selectAll("g")
        .data(force.nodes())
        .enter().append("svg:g");

    // scale all circles and text labels relative to most heavily-linked node
    var max_links = 0.0;
    text.each(function(d) { if (d.links > max_links) { max_links = d.links; } })

    circle
        .attr("r", function(d) { return 20*Math.sqrt(d.links/max_links) + 2; })
        .style("fill", function(d) { return d3.rgb(d.color); })

    text.append("svg:text")
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
  });
}
