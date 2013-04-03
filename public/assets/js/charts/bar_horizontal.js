function bar_horizontal(element_id, data, colors, labels, bar_thickness, show_values)
{
  // default values
  if (typeof(bar_thickness) === 'undefined')
  {
    bar_thickness = 20;
  }
  if (typeof(show_values) === 'undefined')
  {
    show_values = true;
  }

  var chart_initialized = false;

  // append the svg element for drawing the chart on
  var svg = d3.select("#" + element_id).append("svg");

  // compute chart height based on number of elements
  var chart_height = data.length*bar_thickness;

  // set the height of svg element based on chart height and padding amounts
  var padding_l = 120; // need enough space for text labels
  var padding_t = 6;
  var padding_b = 6;
  var svg_height = chart_height + padding_t + padding_b;
  svg.height = svg_height;

  var y_scale = d3.scale.linear()
    .domain([0, data.length])
    .range([0, chart_height]);

  svg.append("g").attr("id", "bar-group")
    .attr("transform", "translate(" + padding_l + "," + padding_t + ")");
  svg.append("g").attr("id", "labels-group")
    .attr("transform", "translate(" + padding_l + "," + padding_t + ")");

  // create an unlabeled y axis (this should have a constant size independent of window resizing)
  var yaxis = d3.svg.axis();
  yaxis.scale(y_scale)
      .orient("left")
      .ticks(0)
      .tickSize(0);
  svg.append("g").attr("class", "axis")
    .attr("transform", "translate(" + padding_l + "," + padding_t + ")")
    .call(yaxis);

  // sum of all data elements is assumed to be a reasonable max x value, used to scale the bar lengths
  var max_x_value = d3.sum(data);

  // render (or re-render) the chart as needed, trying to fit x scale to width of parent element
  var chart_resized = function()
  {
    // recompute element widths based on the width of the parent element
    var svg_width = document.getElementById(element_id).clientWidth;
    var chart_width = svg_width - padding_l;

    // recompute x scale
    var x_scale = d3.scale.linear()
      .domain([0, max_x_value])
      .range([0, chart_width]);

    // set or update color-coded bars for every data element
    var bars = svg.select("#bar-group").selectAll("rect").data(data);
    var value_labels = svg.select("#bar-group").selectAll("text").data(data);
    var axis_labels = svg.select("#labels-group").selectAll("text").data(labels);

    if (!chart_initialized)
    {
      bars.enter().append("rect");
      axis_labels.enter().append("text");
      if (show_values)
      {
        value_labels.enter().append("text");
      }
    }

    bars.attr("class", "bar-horizontal")
      .attr("x", 0)
      .attr("y", function(d, i) { return y_scale(i); })
      .attr("width", function(d) { return x_scale(d); })
      .attr("height", bar_thickness)
      .style("fill", function(d, i) { return colors[i]; });

    axis_labels.attr("class", "axis-labels")
      .attr("x", -6)
      .attr("y", function(d, i) { return y_scale(i) + bar_thickness/2; })
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "central")
      .text(function(d) { return d; });

    if (show_values)
    {
      value_labels.attr("class", "value-labels")
      .attr("x", function(d) { return x_scale(d) + 4; })
      .attr("y", function(d, i) { return y_scale(i) + bar_thickness/2; })
      .attr("dominant-baseline", "central")
      .text(function(d) { return d; });
    }
    
    chart_initialized = true;
  }

  // call chart_resized() to draw the chart for the first time
  chart_resized();

  // return the resize handler so it can be used by the caller
  return {
    resized : chart_resized
  };
}
