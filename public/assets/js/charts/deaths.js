function chartDeaths() {
  // default settings
  var data = {
    key: "Deaths by cause",
    values: [
      { label: "Combat", color: "#cc3333", value: 0 },
      { label: "Murder", color: "#333333", value: 0 },
      { label: "Execution", color: "#ff8800", value: 0 },
      { label: "Illness", color: "#3388bb", value: 0 },
      { label: "Suicide", color: "#999999", value: 0 }
    ]
  };

  // the chart object that will be returned
  var chart = {};

  // expose getter/setters

  chart.data = function(value) {
    if (!arguments.length) return data;

    data.values[0].value = value.combat;
    data.values[1].value = value.murder;
    data.values[2].value = value.execution;
    data.values[3].value = value.illness;
    data.values[4].value = value.suicide;

    return chart;
  };

  // render the chart
  chart.render = function(elementId) {
    chartBarHorizontal()
      .data([data])
      .height(20*5)
      .useBarColors(true)
      .showYAxis(false)
      .render(elementId);

    return chart;
  };
  
  return chart;
}
