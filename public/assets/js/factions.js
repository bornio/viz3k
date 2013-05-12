function FactionsController($scope, $http) {
  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbar_selected = 2;

  set_resize_handler_for("content-area", false);

  var populateFactions = function(factionsData) {
    var factions = factionsData.factions;
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

    // add timeline showing appearances for all factions
    var populateTimeline = function(chaptersData)
    {
      var chapters = chaptersData.chapters;
      var maxPeople = 0;

      // see what the max number of distinct characters to appear in any chapter is
      for (var c = 0; c < chapters.length; c++) {
        if (chapters[c].people.length > maxPeople) {
          maxPeople = chapters[c].people.length;
        }
      }

      // for each faction...
      for (var f = 0; f < factions.length; f++) {
        var faction = factions[f];
        faction.chapters = new Array(chapters.length);

        // find out how many of its members turn up in each chapter
        for (var c = 0; c < chapters.length; c++) {
          var chapter = chapters[c];
          faction.chapters[c] = count_in_faction(faction, chapter);
        }
      }
      
      // display a stacked bar chart of faction appearances per chapter
      var chart = chartAppearanceTimeline("chart-appearances", factions, chapters, maxPeople);
      window.addEventListener("resize", chart.resized, false);

      // assign data to the scope
      $scope.factions = factions;
      $scope.factionsOther = factionsOther;
    }

    // issue an http get to grab the data file
    $http.get("/data/chapters").success(populateTimeline);
  }

  // issue an http get to grab the data file
  $http.get("/data/factions").success(populateFactions);
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
