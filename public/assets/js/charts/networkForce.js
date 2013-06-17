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
    var force = d3.layout.force()
      .size([width, height])
      .charge(-700).linkDistance(160).gravity(0.5);

    force
      .nodes(data.nodes)
      .links(data.links)
      .start();

    return force;
  }

  // render the chart
  chart.render = function(elementId) {
    var force = chart.configure();

    // draw an SVG element for the chart
    var viewBoxSize = "0 0 " + String(width) + " " + String(height);
    var svg = d3.select(elementId).append("svg");
    svg.attr("viewBox", viewBoxSize).attr("width", "100%").attr("height", "100%");

    var links = svg.selectAll("line.link")
      .data(data.links)
      .enter().append("line")
      .attr("class", "link");

    var nodes = svg.selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

    var circles = nodes.append("circle")
      .attr("class", "node")

    var gTexts = svg.append("g").selectAll("g")
      .data(force.nodes())
      .enter().append("g");

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
    gTexts.each(function(d) { if (d.links > maxLinks) { maxLinks = d.links; } })

    circles
      .attr("r", function(d) { return 24*Math.sqrt(d.links/maxLinks) + 2; })
      .style("fill", function(d) { return d3.rgb(d.color); })

    var texts = gTexts.append("text")
      .attr("class", "node")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(function(d) { return d.name })
      .attr("font-size", function(d) { return (String(12*(d.links/maxLinks) + 9) + "px")})
      .style("color", textColor)
      .attr("stroke-width", function(d) { return (String(1.2*(d.links/maxLinks) + 0.2) + "px")});

    force.on("tick", function() {
      links.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      gTexts.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });

    // returns true if a node is directly connected to another node by a link
    var connected = function(i, iOther) {
      return (data.nodes[i].linked.indexOf(iOther) >= 0) ? true : false;
    }

    // functions to highlight characters on mouseover and mouseout
    // note that these are made accessible to other events as well, outside the graph
    var highlightI = function(node, nodeIndex) {
      // partly gray out nodes that are directly linked to this one
      circles.filter(function(d, i) { return connected(nodeIndex, i) ? this : null; })
        .style("fill", function(d) { color = d3.interpolateRgb(circleColorFaded, d.color); return color(0.3); });
      texts.filter(function(d, i) { return connected(nodeIndex, i) ? this : null; })
        .style("fill", textColorInterpol(0.3));

      // fully gray out all other nodes in the graph
      circles.filter(function(d, i) { return (!connected(nodeIndex, i) && (d.id != node.id)) ? this : null; })
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
      // return all graph circles to their standard styles
      circles.style("fill", function(d) { return d3.rgb(d.color); });

      // return all graph texts to their standard styles
      texts.style("fill", textColor);

      // restore opacity of all links
      links.style("stroke-opacity", function(d) {
        return (maxLinkValue > 1) ? 0.8*((d.value - 1)/(maxLinkValue - 1)) + 0.2 : 1;
      });
    }

    circles.on("mouseover", function(d, i) { highlightI(d, i); });
    circles.on("mouseout", function(d, i) { highlightO(d, i); });

    return chart;
  }

  return chart;
}
