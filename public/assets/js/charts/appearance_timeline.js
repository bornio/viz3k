function appearance_timeline(element_id, factions, chapters, max_people)
{
  // append the svg element for drawing the chart on
  var svg = d3.select("#" + element_id).append("svg").attr("class", "chart-appearances");
  var chart_initialized = false;
  var svg_height = document.getElementById("chart-appearances").clientHeight;
  var y_range = d3.scale.linear()
    .domain([0, max_people])
    .range([0, svg_height]);

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

  // render or resize the chart as needed
  var chart_resize = function()
  {
    var svg_width = document.getElementById(element_id).clientWidth;
    var bar_width = svg_width/chapters.length;

    var y_offsets = new Array(chapters.length);
    for (var c = 0; c < chapters.length; c++)
    {
      y_offsets[c] = 0;
    }

    // set or update dimensions of chapter anchors
    anchor_rects
      .attr("x", function(d, i) { return bar_width*i; })
      .attr("y", 0)
      .attr("width", bar_width)
      .attr("height", svg_height)
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

      bars.attr("x", function(d, i) { return bar_width*i; })
          .attr("y", function(d, i) { return svg_height - y_range(d) - y_offsets[i]; })
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
