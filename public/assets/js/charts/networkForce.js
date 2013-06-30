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
  var nodeColorFaded = "#cccccc";
  var textColor = "#000000";
  var textColorFaded = "#aaaaaa";
  var textColorInterpol = d3.interpolateRgb(textColorFaded, textColor);

  // the chart object that will be returned
  var chart = {};

  // private functions

  /**
   * Run a few iterations of the force layout algorithm to let the node
   * positions converge a bit before rendering anything. Reduces visible
   * bouncing of nodes in the first few seconds of rendering the chart.
   */
  function coolOff(force, maxIters) {
    force.start();
    var alphaThresh = 0.01;
    var i = maxIters;
    while (i--) {
      force.tick();
      if (force.alpha() < alphaThresh) {
        break;
      }
    }
  }

  /**
   * There is a bug in Firefox that slows down SVG animations gradually until
   * the browser becomes unresponsive. See
   * https://bugzilla.mozilla.org/show_bug.cgi?id=791699 for details. Display
   * only a static layout for Firefox until the bug is fixed.
   */
  function static() {
    if (jQuery.browser.mozilla) {
      if (jQuery.browser.version <= "22.0") {
        return true;
      }
    }
    return false;
  }

  // scale all circles and text labels relative to most heavily-linked node
  function radius(d) {
    return 22*Math.sqrt(d.degree/data.maxNodeDegree) + 2;
  };

  function renderLinks(svg, dataLinks) {
    var links = svg.selectAll("line.link")
      .data(data.links)
      .enter().append("line")
      .attr("class", "link");

    // scale widths and opacity of all links relative to highest-value link
    var max = data.maxLinkValue;
    var maxWidth = (max < 7) ? max : 7;
    var minWidth = 1;
    var widthRange = maxWidth - minWidth;
    var widthFactor = (max > 1) ? widthRange/(max - 1) : 0;

    links
      .style("stroke-width", function(d) {
        return (d.value - 1)*widthFactor + minWidth; 
      })
      .style("stroke-opacity", function(d) {
        return (max > 1) ? 0.8*((d.value - 1)/(max - 1)) + 0.2 : 1;
      });

    return links;
  }
  
  function renderNodes(svg, dataNodes) {
    var nodes = svg.selectAll("circle.node")
      .data(dataNodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d) { return radius(d); })
      .style("fill", function(d) { return d3.rgb(d.color); });

    return nodes;
  }

  function renderTexts(svg, dataNodes) {
    var texts = svg.selectAll("text.node")
      .data(dataNodes)
      .enter().append("text")
      .attr("class", "node")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(function(d) { return d.name })
      .style("color", textColor)
      .attr("font-size", function(d) {
        return (String(12*(d.degree/data.maxNodeDegree) + 8) + "px")
      });

    return texts;
  }

  // returns true if a node is directly connected to another node by a link
  var connected = function(i0, i1) {
    return (data.nodes[i0].neighbors.indexOf(i1) >= 0) ? true : false;
  }

  // highlight nodes and their neighbors on mouseover
  var highlightI = function(nodes, texts, links, node, nodeIndex) {
    // partly gray out nodes that are directly linked to this one
    nodes.filter(function(d, i) {
      return connected(nodeIndex, i) ? this : null;
    })
      .style("fill", function(d) {
        color = d3.interpolateRgb(nodeColorFaded, d.color);
        return color(0.3); 
      });
    texts.filter(function(d, i) {
      return connected(nodeIndex, i) ? this : null;
    })
      .style("fill", textColorInterpol(0.3));

    // fully gray out all other nodes in the graph
    nodes.filter(function(d, i) {
      return (!connected(nodeIndex, i) && (d.id != node.id)) ? this : null;
    })
      .style("fill", nodeColorFaded);
    texts.filter(function(d, i) {
      return (!connected(nodeIndex, i) && (d.id != node.id)) ? this : null;
    })
      .style("fill", textColorFaded);

    // reduce opacity of all links that do not have this node as a source or target
    links.filter(function(d) {
      return (d.source.id != node.id && d.target.id != node.id) ? this : null;
    })
      .style("stroke-opacity", 0.1);

    // maximize opacity of all links in or out of this node
    links.filter(function(d) {
      return (d.source.id == node.id || d.target.id == node.id) ? this : null;
    })
      .style("stroke-opacity", 1);
  }

  var highlightO = function(nodes, texts, links, node, nodeIndex) {
    // return all graph nodes to their standard styles
    nodes.style("fill", function(d) { return d3.rgb(d.color); });

    // return all graph texts to their standard styles
    texts.style("fill", textColor);

    // restore opacity of all links
    links.style("stroke-opacity", function(d) {
      return (data.maxLinkValue > 1) ? 0.8*((d.value - 1)/(data.maxLinkValue - 1)) + 0.2 : 1;
    });
  }

  // expose getter/setters

  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;

    // compute a few stats
    data.maxLinkValue = d3.max(data.links, function(d) { return d.value; });
    data.minNodeDegree = d3.min(data.nodes, function(d) { return d.degree; });
    data.maxNodeDegree = d3.max(data.nodes, function(d) { return d.degree; });

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
      var halfW = width/2;
      var halfH = height/2;
      var percent = ((data.minNodeDegree + 1)/(data.nodes[n].degree + 1));
      var offsetX = (Math.random() - 0.5)*percent*width;
      var offsetY = (Math.random() - 0.5)*percent*height;
      data.nodes[n].x = halfW + offsetX;
      data.nodes[n].y = halfH + offsetY;
    }

    var force = d3.layout.force()
      .size([width, height])
      .charge(-700).linkDistance(160).gravity(0.5)
      .nodes(data.nodes)
      .links(data.links);

    return force;
  }

  // render the chart
  chart.render = function(elementId) {
    var force = chart.configure();

    // draw an SVG element for the chart
    var svg = d3.select(elementId).append("svg");
    svg.attr("width", width).attr("height", height);

    // make chart invisible until initial rendering is done
    svg.style("visibility", "hidden");

    var links = renderLinks(svg, data.links);
    var nodes = renderNodes(svg, data.nodes);
    var texts = renderTexts(svg, data.nodes);      

    //var time0 = Date.now();
    //var time1;
    //var t = 0;
    function update_positions() {
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
    };

    // let the rest of the page load before doing this
    setTimeout(function() {
      // disable animation in firefox due to suckage
      if (static()) {
        // run enough iterations to get a pretty well converged layout
        coolOff(force, 10000);
      } else {
        // if not static, just run a few iterations before rendering
        coolOff(force, 100);
      }

      nodes.on("mouseover", function(d, i) {
        highlightI(nodes, texts, links, d, i);
      });
      nodes.on("mouseout", function(d, i) {
        highlightO(nodes, texts, links, d, i);
      });

      update_positions();

      if (!static()) {
        // enable mouse dragging
        nodes.call(force.drag);

        // update positions on each tick
        force.on("tick", update_positions);
      }

      // make chart visible
      svg.style("visibility", "visible");
    }, 200);

    return chart;
  }

  return chart;
}
