function appearance_timeline(element_id, factions, chapters, max_people)
{
  var chart_initialized = false;
  // append the svg element for drawing the chart on
  var svg = d3.select("#" + element_id).append("svg").attr("class", "chart-appearances");
  var svg_height = document.getElementById("chart-appearances").clientHeight;
  var padding_l = 24;
  var padding_b = 6;
  var max_height = svg_height - padding_b;
  var y_range = d3.scale.linear()
    .domain([0, max_people])
    .range([0, max_height]);
  var y_range_inverted = d3.scale.linear()
    .domain([0, max_people])
    .range([max_height, 0]);

  // create a bar group for every faction
  for (var f = 0; f < factions.length; f++)
  {
    var faction = factions[f];
    svg.append("g").attr("id", "faction" + String(faction.id));
  }

  // create link anchors for every chapter
  var anchors = svg.selectAll("a").data(chapters).enter().append("a")
    .attr("xlink:href", function(d) { return "/coappear/chapter/" + d.chapter; });
  anchors.append("title").text(function(d) { return "Chapter " + d.chapter; });
  var anchor_rects = anchors.append("rect");

  // create a labeled y axis (this should have a constant size independent of window resizing)
  var yaxis = d3.svg.axis();
  yaxis.scale(y_range_inverted)
      .orient("left")
      .ticks(4)
      .tickSize(2);
  svg.append("g").attr("class", "axis")
    .attr("transform", "translate(" + padding_l + ",0)")
    .call(yaxis);

  // create an unlabeled x axis (this should resize in response to window resizing)
  var svg_width = document.getElementById(element_id).clientWidth;
  var x_range = d3.scale.linear()
    .domain([0, chapters.length])
    .range([0, svg_width]);

  var xaxis = d3.svg.axis();
  xaxis.scale(x_range)
      .orient("bottom")
      .ticks(0)
      .tickSize(0);
  var xaxis_svg = svg.append("g")
    .attr("class", "axis").attr("transform", "translate(" + padding_l + "," + max_height + ")")
    .call(xaxis);

  // render or resize the chart as needed
  var chart_resize = function()
  {
    // recompute element widths based on the width of the parent element
    svg_width = document.getElementById(element_id).clientWidth;
    var bar_width = (svg_width - padding_l)/chapters.length;

    // redraw x axis
    x_range.range([0, svg_width]);
    xaxis.scale(x_range);
    xaxis_svg.call(xaxis);

    var y_offsets = new Array(chapters.length);
    for (var c = 0; c < chapters.length; c++)
    {
      y_offsets[c] = 0;
    }

    // set or update dimensions of chapter anchors
    anchor_rects
      .attr("x", function(d, i) { return padding_l + bar_width*i; })
      .attr("y", 0)
      .attr("width", bar_width)
      .attr("height", max_height)
      .style("fill-opacity", 0);

    // set or update color-coded bars for every faction
    for (var f = 0; f < factions.length; f++)
    {
      var faction = factions[f];
      var bars = svg.select("#faction" + String(faction.id)).selectAll("rect").data(faction.chapters);

      if (!chart_initialized)
      {
        bars.enter().append("rect");
      }

      bars.attr("x", function(d, i) { return padding_l + bar_width*i; })
          .attr("y", function(d, i) { return y_range_inverted(d) - y_offsets[i]; })
          .attr("width", bar_width)
          .attr("height", y_range)
          .style("fill", function(d) { return faction.color; });

      // update offsets
      for (var c = 0; c < chapters.length; c++)
      {
        y_offsets[c] += y_range(faction.chapters[c]);
      }
    }

    chart_initialized = true;
  }

  // call chart_resize() to draw the chart for the first time
  chart_resize();

  window.addEventListener("resize", chart_resize, false);
}
