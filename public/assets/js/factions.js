function FactionsController($scope, $http, $q) {
  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbar_selected = 2;

  set_resize_handler_for("content-area", false);

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
    label_faction_type(factions[i]);

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
  // see what the max number of distinct characters to appear in any chapter is
  var maxPeople = maxPeoplePerChapter(chapters);

  // for each faction...
  for (var f = 0; f < factions.length; f++) {
    var faction = factions[f];
    faction.chapters = new Array(chapters.length);

    // find out how many of its members turn up in each chapter
    for (var c = 0; c < chapters.length; c++) {
      var chapter = chapters[c];
      faction.chapters[c] = countFactionMembersInChapter(faction, chapter);
    }
  }

  // display a stacked bar chart of faction appearances per chapter
  var chart = chartAppearanceTimeline("chart-appearances", factions, chapters, maxPeople);
  window.addEventListener("resize", chart.resized, false);

  return chart;
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

function maxPeoplePerChapter(chapters) {
  var maxPeople = 0;
  for (var c = 0; c < chapters.length; c++) {
    if (chapters[c].people.length > maxPeople) {
      maxPeople = chapters[c].people.length;
    }
  }

  return maxPeople;
}
