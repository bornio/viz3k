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
  var chart = chartFactionsStream().factions(factions).chapters(chapters).render("#chart-factions");  
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
