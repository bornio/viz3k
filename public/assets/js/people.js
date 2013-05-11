function PeopleController($scope, $http, $q) {
  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbar_selected = 3;

  // hide some stuff until it's ready
  $scope.loaded = false;

  set_resize_handler_for("content-area", false);

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
  people_style_parens(people);

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
  $scope.deathsCombat = deaths_of_type(deaths, "combat");
  $scope.deathsMurder = deaths_of_type(deaths, "murder");
  $scope.deathsExecution = deaths_of_type(deaths, "execution");
  $scope.deathsIllness = deaths_of_type(deaths, "illness");
  $scope.deathsSuicide = deaths_of_type(deaths, "suicide");
  $scope.deaths = deaths;
  $scope.combatants = topCombatants(people);

  // draw charts
  var chartDeathsByCause = drawDeathsChart($scope);
  var chartTopCombatants = drawCombatantsChart($scope);
}

function drawDeathsChart($scope) {
  var deathsByCause = new Array(5);
  deathsByCause[0] = $scope.deathsCombat.length;
  deathsByCause[1] = $scope.deathsMurder.length;
  deathsByCause[2] = $scope.deathsExecution.length;
  deathsByCause[3] = $scope.deathsIllness.length;
  deathsByCause[4] = $scope.deathsSuicide.length;

  var causeColors = new Array(5);
  causeColors[0] = "#cc3333";
  causeColors[1] = "#333333";
  causeColors[2] = "#ff8800";
  causeColors[3] = "#3388bb";
  causeColors[4] = "#999999";

  var causeLabels = new Array(5);
  causeLabels[0] = { text: "Combat" };
  causeLabels[1] = { text: "Murder" };
  causeLabels[2] = { text: "Execution" };
  causeLabels[3] = { text: "Illness" };
  causeLabels[4] = { text: "Suicide" };

  var chartDeathsByCause = chartBarHorizontal("chart-deaths-by-cause", deathsByCause, causeColors, causeLabels);
  window.addEventListener("resize", chartDeathsByCause.resized, false);

  return chartDeathsByCause;
}

function drawCombatantsChart($scope) {
  var combatants = new Array($scope.combatants.length);
  for (var i in $scope.combatants) {
    combatants[i] = $scope.combatants[i].killed_combat.length;
  }

  var barColors = new Array(combatants.length);
  for (var i in combatants) {
    barColors[i] = "#77aadd";
  }

  var nameLabels = new Array(combatants.length);
  for (var i in combatants) {
    nameLabels[i] = { text: $scope.combatants[i].name, href: "/people/" + String($scope.combatants[i].id) };
  }

  var chartTopCombatants = chartBarHorizontal("chart-top-combatants", combatants, barColors, nameLabels);
  window.addEventListener("resize", chartTopCombatants.resized, false);

  return chartTopCombatants;
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
