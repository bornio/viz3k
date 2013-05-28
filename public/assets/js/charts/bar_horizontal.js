/**
 * General purpose horizontal bar chart using NVD3.js.
 */
function chartBarHorizontal() {
  // default settings
  var data = [];
  var customLabels = [];
  var showValues = true;
  var showXAxis = true;
  var showYAxis = true;
  var valueFormat = d3.format(',d');
  var useBarColors = false;
  var height = 100;

  // the chart object that will be returned
  var chart = {};

  // expose getter/setters

  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;
    return chart;
  };

  chart.showValues = function(value) {
    if (!arguments.length) return showValues;
    showValues = value;
    return chart;
  };

  chart.showAxes = function(value) {
    if (!arguments.length) return showAxes;
    showXAxis = value;
    showYAxis = value;
    return chart;
  };

  chart.showYAxis = function(value) {
    if (!arguments.length) return showAxes;
    showYAxis = value;
    return chart;
  };

  chart.showXAxis = function(value) {
    if (!arguments.length) return showAxes;
    showXAxis = value;
    return chart;
  };

  chart.valueFormat = function(value) {
    if (!arguments.length) return valueFormat;
    valueFormat = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  // If set to true, the render() function will look for a color attribute on each bar's data value.
  chart.useBarColors = function(value) {
    if (!arguments.length) return useBarColors;
    useBarColors = value;
    return chart;
  }

  /**
   * If set to a non-empty array, drawCustomLabels() will be called by render() to replace the default NVD3 axis labels
   * with our own custom ones. There should be as many labels as bars in the chart. Each label's label attribute is the
   * text displayed, while the href attribute is used to turn each label into a clickable link.
   */
  chart.customLabels = function(value) {
    if (!arguments.length) return customLabels;
    customLabels = value;
    return chart;
  }

  function drawCustomLabels(nvChart, elementId) {
    var offset = height/customLabels.length;
    var scale = nvChart.xAxis.scale();

    // remove default axis labels
    var axis = d3.select(elementId + " svg").select('.nv-x .nv-axis').select('g');
    axis.selectAll('g').remove();

    // add our own axis labels with hyperlinks
    var g = axis.selectAll("g").data(customLabels).enter().append("g");
    var a = g.append("a")
      .attr("xlink:href", function(d) { return d.href; })
      .append("text")
      .text(function(d) { return d.label; });

    a.attr("class", "axis-labels")
      .attr("x", -nvChart.xAxis.tickPadding())
      .attr("y", function(d, i) { return scale(i) + offset/2; })
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "central");
  }

  function removeTickLines(nvChart, elementId) {
    d3.select(elementId + " svg").select('.nv-x .nv-axis').selectAll('line').remove();
  }

  // configure the NVD3.js multibar horizontal chart based on our settings
  chart.configure = function() {
    var nvChart = nv.models.multiBarHorizontalChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .margin({top: 0, right: 20, bottom: 0, left: 100})
      .showLegend(false)
      .tooltips(false)
      .showControls(false)
      .showValues(showValues).valueFormat(valueFormat);

    if (useBarColors) {
      nvChart.barColor(function(d) { return d.color });
    }

    if (!showXAxis) {
      nvChart.xAxis.tickValues([]);
    }

    if (!showYAxis) {
      nvChart.yAxis.tickValues([]);
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
        // never show tick lines in this chart
        removeTickLines(nvChart, elementId);

        // draw custom labels, if any, on the x axis
        if (showXAxis && customLabels.length > 0) {
          drawCustomLabels(nvChart, elementId);
        }
      }

      nv.utils.windowResize(updated);
      updated();

      return nvChart;
    });

    return chart;
  }

  return chart;
};
