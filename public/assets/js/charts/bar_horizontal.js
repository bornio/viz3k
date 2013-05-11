/**
 * General purpose horizontal bar chart.
 */
function chartBarHorizontal(elementId, data, colors, labels, barThickness, showValues) {
  // default values
  if (typeof(barThickness) === 'undefined') {
    barThickness = 20;
  }
  if (typeof(showValues) === 'undefined') {
    showValues = true;
  }

  var chartInitialized = false;

  // append the svg element for drawing the chart on
  var svg = d3.select("#" + elementId).append("svg");

  // compute chart height based on number of elements
  var chartHeight = data.length*barThickness;

  // set the height of svg element based on chart height and padding amounts
  var paddingLeft = 120; // need enough space for text labels
  var paddingTop = 6;
  var paddingBottom = 6;
  var svgHeight = chartHeight + paddingTop + paddingBottom;
  svg.attr("width", "100%"); // for firefox -- WebKit defaults to 100% anyway
  svg.attr("height", svgHeight);

  var yScale = d3.scale.linear()
    .domain([0, data.length])
    .range([0, chartHeight]);

  svg.append("g").attr("id", "bar-group")
    .attr("transform", "translate(" + paddingLeft + "," + paddingTop + ")");
  svg.append("g").attr("id", "labels-group")
    .attr("transform", "translate(" + paddingLeft + "," + paddingTop + ")");

  // create an unlabeled y axis (this should have a constant size independent of window resizing)
  var yAxis = d3.svg.axis();
  yAxis.scale(yScale)
    .orient("left")
    .ticks(0)
    .tickSize(0);
  svg.append("g").attr("class", "axis")
    .attr("transform", "translate(" + paddingLeft + "," + paddingTop + ")")
    .call(yAxis);

  // max of all data elements is used to scale the bar lengths
  var maxXValue = d3.max(data)*1.5;

  var bars = svg.select("#bar-group").selectAll("rect").data(data);
  var valueLabels = svg.select("#bar-group").selectAll("text").data(data);
  var axisLabels = defineAxisLabels(svg.select("#labels-group"), labels);

  // render (or re-render) the chart as needed, trying to fit x scale to width of parent element
  var chartResized = function() {
    // recompute element widths based on the width of the parent element
    var svgWidth = document.getElementById(elementId).clientWidth;
    var chartWidth = svgWidth - paddingLeft;

    // recompute x scale
    var xScale = d3.scale.linear()
      .domain([0, maxXValue])
      .range([0, chartWidth]);

    // set or update color-coded bars for every data element, along with labels
    if (!chartInitialized) {
      bars.enter().append("rect");
      initAxisLabels(axisLabels);
      
      if (showValues) {
        valueLabels.enter().append("text");
      }
    }

    bars.attr("class", "bar-horizontal")
      .attr("x", 0)
      .attr("y", function(d, i) { return yScale(i); })
      .attr("width", function(d) { return xScale(d); })
      .attr("height", barThickness - 1)
      .style("fill", function(d, i) { return colors[i]; });

    drawAxisLabels(axisLabels, yScale, barThickness);

    if (showValues) {
      valueLabels.attr("class", "value-labels")
      .attr("x", function(d) { return xScale(d) + 4; })
      .attr("y", function(d, i) { return yScale(i) + barThickness/2; })
      .attr("dominant-baseline", "central")
      .text(function(d) { return d; });
    }
    
    chartInitialized = true;
  }

  // call chartResized() to draw the chart for the first time
  chartResized();

  // return the resize handler so it can be used by the caller
  return {
    resized : chartResized
  };
}

function defineAxisLabels(parent, labels)
{
  var hasHrefs = false;
  for (var i in labels) {
    if ("href" in labels[i]) {
      hasHrefs = true;
    } else {
      labels[i].href = "#";
    }
  }

  if (hasHrefs) {
    return {
      anchors : parent.selectAll("a").data(labels)
    };
  } else {
    return {
      texts : parent.selectAll("text").data(labels)
    };
  }
}

function initAxisLabels(axisLabels) {
  if ("anchors" in axisLabels) {
    axisLabels.anchors.enter().append("a");
    axisLabels.texts = axisLabels.anchors.append("text");
  } else {
    axisLabels.texts.enter().append("text");
  }
}

function drawAxisLabels(axisLabels, yScale, barThickness)
{
  if ("anchors" in axisLabels) {
    axisLabels.anchors.attr("class", "axis-labels")
      .attr("xlink:href", function(d) { return d.href; });
  }
  
  axisLabels.texts.attr("class", "axis-labels")
    .attr("x", -6)
    .attr("y", function(d, i) { return yScale(i) + barThickness/2; })
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "central")
    .text(function(d) { return d.text; });
}
