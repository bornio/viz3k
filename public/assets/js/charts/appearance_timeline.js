function chartAppearanceTimeline(elementId, factions, chapters, maxPeople)
{
  var chartInitialized = false;
  // append the svg element for drawing the chart on
  var svg = d3.select("#" + elementId).append("svg");
  svg.attr("width", "100%"); // for firefox -- WebKit defaults to 100% anyway
  var svgHeight = document.getElementById(elementId).clientHeight;
  var paddingLeft = 24;
  var paddingTop = 6;
  var paddingBottom = 6;
  var maxHeight = svgHeight - paddingTop - paddingBottom;
  var yRange = d3.scale.linear()
    .domain([0, maxPeople])
    .range([0, maxHeight]);
  var yRangeInverted = d3.scale.linear()
    .domain([0, maxPeople])
    .range([maxHeight, 0]);

  // create a bar group for every faction
  for (var f = 0; f < factions.length; f++) {
    var faction = factions[f];
    svg.append("g").attr("id", "faction" + String(faction.id));
  }

  // create link anchors for every chapter
  var anchors = svg.selectAll("a").data(chapters).enter().append("a")
    .attr("xlink:href", function(d) { return "/chapters/" + d.chapter; });
  anchors.append("title").text(function(d) { return "Chapter " + d.chapter; });
  var anchorRects = anchors.append("rect");

  // create a labeled y axis (this should have a constant size independent of window resizing)
  var yAxis = d3.svg.axis();
  var numTicks = 4;
  if (maxPeople == 2) {
    numTicks = 2;
  } else if (maxPeople == 1) {
    numTicks = 1;
  }
  yAxis.scale(yRangeInverted)
      .orient("left")
      .ticks(numTicks)
      .tickSize(2);
  svg.append("g").attr("class", "axis")
    .attr("transform", "translate(" + paddingLeft + "," + paddingTop + ")")
    .call(yAxis);

  // create an unlabeled x axis (this should resize in response to window resizing)
  var svgWidth = document.getElementById(elementId).clientWidth;
  var xRange = d3.scale.linear()
    .domain([0, chapters.length])
    .range([0, svgWidth]);

  var xAxis = d3.svg.axis();
  xAxis.scale(xRange)
      .orient("bottom")
      .ticks(0)
      .tickSize(0);
  var xAxisSvg = svg.append("g")
    .attr("class", "axis").attr("transform", "translate(" + paddingLeft + "," + (paddingTop + maxHeight) + ")")
    .call(xAxis);

  // render or resize the chart as needed
  var chartResized = function() {
    // recompute element widths based on the width of the parent element
    svgWidth = document.getElementById(elementId).clientWidth;
    var barWidth = (svgWidth - paddingLeft)/chapters.length;

    // redraw x axis
    xRange.range([0, svgWidth]);
    xAxis.scale(xRange);
    xAxisSvg.call(xAxis);

    var yOffsets = new Array(chapters.length);
    for (var c = 0; c < chapters.length; c++) {
      yOffsets[c] = 0;
    }

    // set or update dimensions of chapter anchors
    anchorRects
      .attr("x", function(d, i) { return paddingLeft + barWidth*i; })
      .attr("y", paddingTop)
      .attr("width", barWidth)
      .attr("height", maxHeight)
      .style("fill-opacity", 0);

    // set or update color-coded bars for every faction
    for (var f = 0; f < factions.length; f++) {
      var faction = factions[f];
      var bars = svg.select("#faction" + String(faction.id)).selectAll("rect").data(faction.chapters);

      if (!chartInitialized) {
        bars.enter().append("rect");
      }

      bars.attr("x", function(d, i) { return paddingLeft + barWidth*i; })
        .attr("y", function(d, i) { return paddingTop + yRangeInverted(d) - yOffsets[i]; })
        .attr("width", barWidth)
        .attr("height", yRange)
        .style("fill", function(d) { return faction.color; });

      // update offsets
      for (var c = 0; c < chapters.length; c++) {
        yOffsets[c] += yRange(faction.chapters[c]);
      }
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
