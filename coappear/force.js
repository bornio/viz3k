function coappear(data_file_path)
{
  var width = 1280, height = 1280;
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

    node.append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return 3*Math.log(d.links); })
        .style("fill", function(d) { return d3.rgb(d.color); })

    node.append("text")
        .attr("dx", 0)
        .attr("dy", 0)
        .text(function(d) { return d.name })
        .attr("font-size", function(d) { return (String(0.2*d.links + 5) + "px")});

    force.on("tick", function()
    {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
  });
}
