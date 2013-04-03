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
  svg.attr("width", "100%"); // for firefox -- WebKit defaults to 100% anyway
  svg.attr("height", svg_height);

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

  // max of all data elements is used to scale the bar lengths
  var max_x_value = d3.max(data)*1.5;

  var bars = svg.select("#bar-group").selectAll("rect").data(data);
  var value_labels = svg.select("#bar-group").selectAll("text").data(data);
  var axis_labels = define_axis_labels(svg.select("#labels-group"), labels);

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

    // set or update color-coded bars for every data element, along with labels
    if (!chart_initialized)
    {
      bars.enter().append("rect");
      init_axis_labels(axis_labels);
      
      if (show_values)
      {
        value_labels.enter().append("text");
      }
    }

    bars.attr("class", "bar-horizontal")
      .attr("x", 0)
      .attr("y", function(d, i) { return y_scale(i); })
      .attr("width", function(d) { return x_scale(d); })
      .attr("height", bar_thickness - 1)
      .style("fill", function(d, i) { return colors[i]; });

    draw_axis_labels(axis_labels, y_scale, bar_thickness);

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

function define_axis_labels(parent, labels)
{
  var has_hrefs = false;
  for (var i in labels)
  {
    if ("href" in labels[i])
    {
      has_hrefs = true;
    }
    else
    {
      labels[i].href = "#";
    }
  }

  if (has_hrefs)
  {
    return {
      anchors : parent.selectAll("a").data(labels)
    };
  }
  else
  {
    return {
      texts : parent.selectAll("text").data(labels)
    };
  }
}

function init_axis_labels(axis_labels)
{
  if ("anchors" in axis_labels)
  {
    axis_labels.anchors.enter().append("a");
    axis_labels.texts = axis_labels.anchors.append("text");
  }
  else
  {
    axis_labels.texts.enter().append("text");
  }
}

function draw_axis_labels(axis_labels, y_scale, bar_thickness)
{
  if ("anchors" in axis_labels)
  {
    axis_labels.anchors.attr("class", "axis-labels")
      .attr("xlink:href", function(d) { return d.href; });
  }
  
  axis_labels.texts.attr("class", "axis-labels")
    .attr("x", -6)
    .attr("y", function(d, i) { return y_scale(i) + bar_thickness/2; })
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "central")
    .text(function(d) { return d.text; });
}
