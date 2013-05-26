function chartCombatants() {
  // default settings
  var data = {
    label: "Deadliest combatants",
    color: "#6699cc",
    values: []
  };

  // the chart object that will be returned
  var chart = {};

  // expose getter/setters

  chart.data = function(value) {
    if (!arguments.length) return data;

    var values = [];
    for (var i in value) {
      values.push({
        label: value[i].name,
        href: "/people/" + String(value[i].id),
        value: value[i].killed_combat.length
      });
    }

    data.values = values;

    return chart;
  };

  // render the chart
  chart.render = function(elementId) {
    chartBarHorizontal()
      .data([data])
      .height(20*data.values.length)
      .showYAxis(false)
      .customLabels(data.values)
      .render(elementId);

    return chart;
  };
  
  return chart;
}
