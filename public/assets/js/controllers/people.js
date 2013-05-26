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

  // draw charts
  var chartDeathsByCause = chartDeaths().data(countDeathsByType(deaths)).render("#chart-deaths-by-cause");
  var chartTopCombatants = chartCombatants().data(topCombatants(people)).render("#chart-top-combatants");
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
