function FactionsController($scope, $http, $q) {
  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbarSelected = 2;

  setResizeHandlerFor("content-area", false);

  // get our data from the backend
  var promises = [$http.get("/data/factions"), $http.get("/data/chapters")];
  $q.all(promises).then(function(results) {
    var factions = results[0].data.factions;
    var chapters = results[1].data.chapters;

    // we have all the data we need
    renderView($scope, factions, chapters);
  });
}

function renderView($scope, factions, chapters) {
  var factionsOther;

  for (var i = 0; i < factions.length; i++) {
    // for non-generic faction types, label the type in parentheses
    labelFactionType(factions[i]);

    // keep the "Other" faction (id = 99) separate
    if (factions[i].id == 99) {
      factionsOther = [factions[i]];
      factions.splice(i,1);
    }
  }

  // sort the factions
  factions = sortFactionsBySize(factions);

  // assign data to the scope
  $scope.factions = factions;
  $scope.factionsOther = factionsOther;

  // draw charts
  var chart = chartFactionAppearances($scope, factions, chapters);  
}

function chartFactionAppearances($scope, factions, chapters) {
  // for each faction...
  var chartData = new Array(factions.length);
  var colors = new Array(factions.length);
  for (var f = 0; f < factions.length; f++) {
    var faction = factions[f];
    var values = new Array(chapters.length);

    // find out how many of its members turn up in each chapter
    for (var c = 0; c < chapters.length; c++) {
      var chapter = chapters[c];
      values[c] = [c, countFactionMembersInChapter(faction, chapter)];
    }

    chartData[f] = { key: faction.name, values: values };
    colors[f] = faction.color;
  }

  // display a streamgraph of faction member appearances per chapter
  var stream = chartStream().data(chartData).colors(colors).tooltip(factionTooltip).render("#stream-test");

  return stream;
}

function factionTooltip(key, x, y, e, graph) {
  return '<h3>' + key + '</h3>' +
         '<p>' +  y + ' members in Chapter ' + x + '</p>';
}

function sortFactionsBySize(factions) {
  var sorted = factions.slice();
  sorted.sort(function(a,b) {
    // use alphabetical name sorting as tie-breaker
    if (b.members.length == a.members.length) {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;          
    }

    return b.members.length - a.members.length;
  });

  return sorted;
}
