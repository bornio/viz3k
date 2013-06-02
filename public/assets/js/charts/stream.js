/**
 * General purpose stream chart using NVD3.js.
 */
function chartStream() {
  // default settings
  var data = [];
  var colors = null;
  var height = 200;
  var showXAxis = true;
  var showYAxis = true;
  var xTickFormat = d3.format(',d');
  var yTickFormat = d3.format(',.0f');
  var style = 'stream';
  var tooltip = null;

  // the chart object that will be returned
  var chart = {};

  // expose getter/setters

  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;
    return chart;
  };

  chart.colors = function(value) {
    if (!arguments.length) return colors;
    colors = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  chart.showYAxis = function(value) {
    if (!arguments.length) return showYAxis;
    showYAxis = value;
    return chart;
  };

  chart.showXAxis = function(value) {
    if (!arguments.length) return showXAxis;
    showXAxis = value;
    return chart;
  };

  chart.style = function(value) {
    if (!arguments.length) return style;
    style = value;
    return chart;
  };

  chart.tooltip = function(value) {
    if (!arguments.length) return tooltip;
    tooltip = value;
    return chart;
  };

  // configure the NVD3.js stacked area chart based on our settings
  chart.configure = function() {
    var nvChart = nv.models.stackedAreaChart()
      .x(function(d) { return d[0] })
      .y(function(d) { return d[1] })
      .showLegend(false)
      .showControls(false)
      .clipEdge(false);

    // 'stream', 'stack', or 'expand' (percentage)
    nvChart.stacked.style(style);

    // x axis settings
    if (showXAxis) {
      nvChart.xAxis.tickFormat(xTickFormat).showMaxMin(true);
    } else {
      nvChart.xAxis.tickValues([]).showMaxMin(false);
    }

    // y axis settings
    nvChart.yAxis.tickFormat(yTickFormat);
    if (showYAxis) {
      if (style == 'stack') {
        nvChart.yAxis.tickValues([0]).showMaxMin(true);
      }
    } else {
      nvChart.yAxis.tickValues([]).showMaxMin(false);
    }

    // customize tooltip
    if (tooltip != null) {
      nvChart.tooltipContent(tooltip);
    }

    nvChart.margin({left: 30, right: 10, top: 20, bottom: 40 });

    // customize colors
    if (colors != null) {
      nvChart.color(colors);
    }

    return nvChart;
  }

  // render the chart
  chart.render = function(elementId) {
    nv.addGraph(function() {
      var nvChart = chart.configure();
      
      d3.select(elementId + " svg").datum(data)
        .attr("width", "100%") // for firefox -- WebKit defaults to 100% anyway
        .attr("height", height)
        .call(nvChart);

      nv.utils.windowResize(nvChart.update);

      var updated = function() {
        // disable clicking to expand items in the stream
        nvChart.stacked.dispatch.on('areaClick.toggle', null);
      }

      nv.utils.windowResize(updated);
      updated();

      return nvChart;
    });

    return chart;
  }

  return chart;
};
