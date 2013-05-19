function PeopleController($scope, $http, $q) {
  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbarSelected = 3;

  // hide some stuff until it's ready
  $scope.loaded = false;

  setResizeHandlerFor("content-area", false);

  // get our data from the backend
  var promises = [$http.get("/data/people"), $http.get("/data/factions"), $http.get("/data/deaths")];
  $q.all(promises).then(function(results) {
    var people = results[0].data.people;
    var factions = results[1].data.factions;
    var deaths = results[2].data.deaths;

    // we have all the data we need
    renderView($scope, people, factions, deaths);
  });
}

function renderView($scope, people, factions, deaths) {
  // add style name (if any) in parentheses
  peopleStyleParens(people);

  // add faction data to people
  for (var p in people) {
    for (var f in factions) {
      if (people[p].faction == factions[f].id) {
        people[p].faction_name = factions[f].name;
        people[p].faction_type = factions[f].type;
        people[p].faction_color = factions[f].color;
      }
    }
  }

  // save people to scope
  $scope.people = people;
  $scope.loaded = true;

  // save death stats to scope
  $scope.deaths = deaths;

  // count deaths of each type
  var counts = {
    combat: deathsOfType(deaths, "combat").length,
    murder: deathsOfType(deaths, "murder").length,
    execution: deathsOfType(deaths, "execution").length,
    illness: deathsOfType(deaths, "illness").length,
    suicide: deathsOfType(deaths, "suicide").length,
  }

  // draw charts
  var barThickness = 20;
  var chartDeathsByCause = drawDeathsChart(counts, barThickness);
  var chartTopCombatants = drawCombatantsChart(topCombatants(people), barThickness);
}

function drawDeathsChart(deathCounts, barThickness) {
  var chartData = [
    {
      key: "Deaths by cause",
      values: [
        {
          label: "Combat",
          color: "#cc3333",
          value: deathCounts.combat
        },
        {
          label: "Murder",
          color: "#333333",
          value: deathCounts.murder
        },
        {
          label: "Execution",
          color: "#ff8800",
          value: deathCounts.execution
        },
        {
          label: "Illness",
          color: "#3388bb",
          value: deathCounts.illness
        },
        {
          label: "Suicide",
          color: "#999999",
          value: deathCounts.suicide
        }
      ]
    }
  ];

  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .barColor(function(d) { return d.color })
      .margin({top: 0, right: 20, bottom: 0, left: 100})
      .showValues(true).valueFormat(d3.format(',d'))
      .showLegend(false)
      .tooltips(false)
      .showControls(false);

    d3.select('#chart-deaths-by-cause svg').datum(chartData)
      .attr("width", "100%") // for firefox -- WebKit defaults to 100% anyway
      .attr("height", barThickness*5)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function drawCombatantsChart(combatants, barThickness) {
  var values = [];
  for (var i in combatants) {
    //var href = "/people/" + String(combatants[i].id);
    values.push({
      label: combatants[i].name,
      href: "/people/" + String(combatants[i].id),
      value: combatants[i].killed_combat.length
    });
  }

  var chartData = [{
    label: "Deadliest combatants",
    color: "#6699cc",
    values: values
  }];
  
  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .margin({top: 0, right: 20, bottom: 0, left: 100})
      .showValues(true).valueFormat(d3.format(',d'))
      .showLegend(false)
      .tooltips(false)
      .showControls(false);

    d3.select('#chart-top-combatants svg').datum(chartData)
      .attr("width", "100%") // for firefox -- WebKit defaults to 100% anyway
      .attr("height", barThickness*combatants.length)
      .call(chart);

    var redraw = replaceLabels(chart, values, barThickness);
    nv.utils.windowResize(chart.update);
    nv.utils.windowResize(redraw);
    redraw();

    return chart;
  });
}

function replaceLabels(chart, values, barThickness) {
  return function() {
    // remove default axis labels
    var axis = d3.select('#chart-top-combatants svg').select('.nv-x .nv-axis').select('g');
    axis.selectAll('g').remove();

    // add our own axis labels with hyperlinks
    var scale = chart.xAxis.scale();
    var g = axis.selectAll("g").data(values).enter().append("g");
    var a = g.append("a")
      .attr("xlink:href", function(d) { return d.href; })
      .append("text")
      .text(function(d) { return d.label; });

    a.attr("class", "axis-labels")
      .attr("x", -chart.xAxis.tickPadding())
      .attr("y", function(d, i) { return scale(i) + barThickness/2; })
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "central");
  }
}

function topCombatants(people) {
  var combatants = people.filter(function(element, index, array) {
    return element.killed_combat.length > 0;
  });

  combatants.sort(function(a,b) {
    if (b.killed_combat.length == a.killed_combat.length) {
      // use alphabetical name sorting as tie-breaker
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;          
    }

    return b.killed_combat.length - a.killed_combat.length;
  });

  return combatants;
}
