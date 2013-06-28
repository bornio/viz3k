/**
 * This chart is used to draw networks of nodes and links interactively, with each node labeled according to its name,
 * sized according to the number of links it has, and animated according to the charge between nodes (which causes them
 * to repel each other) and the links (which attract pairs of linked nodes toward one another).
 *
 * Mousing over a node will highlight it, and partially highlight its neighbors.
 */
function chartNetworkForce() {
  // default settings
  var data = {nodes: [], links: []};
  var width = 680;
  var height = 680;

  // the chart object that will be returned
  var chart = {};

  // private functions

  /**
   * Run a few iterations of the force layout algorithm to let the node
   * positions converge a bit before rendering anything. Reduces visible
   * bouncing of nodes in the first few seconds of rendering the chart.
   */
  function cool_off(force, alpha_thresh, max_iters) {
    force.start();
    var i = max_iters;
    while (i--) {
      force.tick();
      if(force.alpha() < alpha_thresh) {
        break;
      }
    }
    force.stop();
  }

  // expose getter/setters

  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;
    return chart;
  };

  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  // configure the d3.js force based layout using our settings
  chart.configure = function() {
    // seed nodes with initial locations
    for (var n in data.nodes) {
      var half_w = width/2;
      var half_h = height/2;
      var offset_x = (Math.random() - 1)*(1/(data.nodes[n].degree + 1))*width;
      var offset_y = (Math.random() - 1)*(1/(data.nodes[n].degree + 1))*height;
      data.nodes[n].x = half_w + offset_x;
      data.nodes[n].y = half_h + offset_y;
    }

    var force = d3.layout.force()
      .size([width, height])
      .charge(-700).linkDistance(160).gravity(0.5)
      .nodes(data.nodes)
      .links(data.links);

    cool_off(force, 0.001, 200);

    return force;
  }

  // render the chart
  chart.render = function(elementId) {
    var force = chart.configure();

    // draw an SVG element for the chart
    var svg = d3.select(elementId).append("svg");
    svg.attr("width", width).attr("height", height);

    var links = svg.selectAll("line.link")
      .data(data.links)
      .enter().append("line")
      .attr("class", "link");

    var nodes = svg.selectAll("circle")
      .data(data.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .call(force.drag);

    var texts = svg.selectAll("g")
      .data(force.nodes())
      .enter().append("text")
      .attr("class", "node")

    // standard colors
    var circleColorFaded = "#cccccc";
    var textColor = "#000000";
    var textColorFaded = "#aaaaaa";
    var textColorInterpol = d3.interpolateRgb(textColorFaded, textColor);

    // scale all links relative to highest-value link
    var maxLinkValue = 1;
    links.each(function(d) { if (d.value > maxLinkValue) { maxLinkValue = d.value; } })
    var maxLineW = (maxLinkValue < 7) ? maxLinkValue : 7;
    var minLineW = 1;
    var lineWRange = maxLineW - minLineW;
    var lineWFactor = (maxLinkValue > 1) ? lineWRange/(maxLinkValue - 1) : 0;
    links
      .style("stroke-width", function(d) { return (d.value - 1)*lineWFactor + minLineW; })
      .style("stroke-opacity", function(d) {
        return (maxLinkValue > 1) ? 0.8*((d.value - 1)/(maxLinkValue - 1)) + 0.2 : 1;
      });

    // scale all circles and text labels relative to most heavily-linked node
    var maxLinks = 0.0;
    texts.each(function(d) { if (d.degree > maxLinks) { maxLinks = d.degree; } });
    function radius(d) {
      return 22*Math.sqrt(d.degree/maxLinks) + 2;
    };

    nodes
      .attr("r", function(d) { return radius(d); })
      .style("fill", function(d) { return d3.rgb(d.color); })

    texts
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(function(d) { return d.name })
      .attr("font-size", function(d) { return (String(12*(d.degree/maxLinks) + 8) + "px")})
      .style("color", textColor);

    // update positions on each tick
    //var time0 = Date.now();
    //var time1;
    //var t = 0;
    force.on("tick", function() {
      // enforce a bounding box that nodes must stay within
      nodes.each(function(d) {
        r = radius(d);
        d.x = Math.max(r, Math.min(width - r, d.x));
        d.y = Math.max(r, Math.min(height - r, d.y));
      });

      // update node positions
      nodes.attr("cx", function(d) { return d.x });
      nodes.attr("cy", function(d) { return d.y });
      texts.attr("x", function(d) { return d.x });
      texts.attr("y", function(d) { return d.y });

      // update link positions
      links
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      //time1 = Date.now();
      //if (t % 10 == 0)
      //  console.log("ticks per s:", (1000 / (time1 - time0)).toFixed(3));
      //time0 = time1;
      //t++;
    });

    // returns true if a node is directly connected to another node by a link
    var connected = function(i, iOther) {
      return (data.nodes[i].neighbors.indexOf(iOther) >= 0) ? true : false;
    }

    // functions to highlight characters on mouseover and mouseout
    var highlightI = function(node, nodeIndex) {
      // partly gray out nodes that are directly linked to this one
      nodes.filter(function(d, i) { return connected(nodeIndex, i) ? this : null; })
        .style("fill", function(d) { color = d3.interpolateRgb(circleColorFaded, d.color); return color(0.3); });
      texts.filter(function(d, i) { return connected(nodeIndex, i) ? this : null; })
        .style("fill", textColorInterpol(0.3));

      // fully gray out all other nodes in the graph
      nodes.filter(function(d, i) { return (!connected(nodeIndex, i) && (d.id != node.id)) ? this : null; })
        .style("fill", circleColorFaded);
      texts.filter(function(d, i) { return (!connected(nodeIndex, i) && (d.id != node.id)) ? this : null; })
        .style("fill", textColorFaded);

      // reduce opacity of all links that do not have this node as a source or target
      links.filter(function(d) { return (d.source.id != node.id && d.target.id != node.id) ? this : null; })
        .style("stroke-opacity", 0.1);

      // maximize opacity of all links in or out of this node
      links.filter(function(d) { return (d.source.id == node.id || d.target.id == node.id) ? this : null; })
        .style("stroke-opacity", 1);
    }

    var highlightO = function(node, nodeIndex)
    {
      // return all graph nodes to their standard styles
      nodes.style("fill", function(d) { return d3.rgb(d.color); });

      // return all graph texts to their standard styles
      texts.style("fill", textColor);

      // restore opacity of all links
      links.style("stroke-opacity", function(d) {
        return (maxLinkValue > 1) ? 0.8*((d.value - 1)/(maxLinkValue - 1)) + 0.2 : 1;
      });
    }

    nodes.on("mouseover", function(d, i) { highlightI(d, i); });
    nodes.on("mouseout", function(d, i) { highlightO(d, i); });

    force.start();

    return chart;
  }

  return chart;
}
