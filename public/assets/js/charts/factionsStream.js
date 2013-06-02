function chartFactionsStream($scope, factions, chapters) {
  // default settings
  var factions = [];
  var chapters = [];
  var style = 'stream';

  // the chart object that will be returned
  var chart = {};

  // expose getter/setters

  chart.factions = function(value) {
    if (!arguments.length) return factions;
    factions = value;
    return chart;
  };

  chart.chapters = function(value) {
    if (!arguments.length) return chapters;
    chapters = value;
    return chart;
  };

  chart.style = function(value) {
    if (!arguments.length) return style;
    style = value;
    return chart;
  };

  // render the chart
  chart.render = function(elementId) {
    var data = new Array(factions.length);
    var colors = new Array(factions.length);
    for (var f = 0; f < factions.length; f++) {
      var faction = factions[f];
      var values = new Array(chapters.length);

      // find out how many of its members turn up in each chapter
      for (var c = 0; c < chapters.length; c++) {
        var chapter = chapters[c];
        values[c] = [chapter.chapter, countFactionMembersInChapter(faction, chapter)];
      }

      data[f] = { key: faction.name, values: values };
      colors[f] = faction.color;
    }

    var stream = chartStream()
      .data(data)
      .colors(colors)
      .tooltip(factionTooltip)
      .style(style);

    if (factions.length == 1) {
      stream.height(120);
    }

    stream.render(elementId);

    return chart;
  };

  function factionTooltip(key, x, y, e, graph) {
    return '<h3>' + key + '</h3>' +
           '<p>' +  y + ' members in Chapter ' + x + '</p>';
  }
  
  return chart;
}
