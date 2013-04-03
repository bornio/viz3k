function Deaths($scope, $http)
{
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 4;

  // get all death records
  $http.get("/data/deaths").success(populate_deaths_info($scope, $http));

  set_resize_handler_for("content-area", false);
}

function populate_deaths_info($scope, $http, deaths_json)
{
  return function(deaths_json)
  {
    var deaths = deaths_json.deaths;
    $scope.deaths_combat = deaths_of_type(deaths, "combat");
    $scope.deaths_murder = deaths_of_type(deaths, "murder");
    $scope.deaths_execution = deaths_of_type(deaths, "execution");
    $scope.deaths_illness = deaths_of_type(deaths, "illness");
    $scope.deaths_suicide = deaths_of_type(deaths, "suicide");
    $scope.deaths = deaths;

    var chart_deaths_by_cause = draw_deaths_chart($scope);

    // get info about who killed whom
    $http.get("/data/people").success(populate_combatants_info($scope, $http));
  }
}

function populate_combatants_info($scope, $http, people_json)
{
  return function(people_json)
  {
    var people = people_sort_by_kills(people_json.people);
    var combatants = [];
    for (var p in people)
    {
      if (people[p].killed_combat.length > 0)
      {
        combatants.push(people[p]);
      }
    }
    $scope.combatants = combatants;

    var chart_top_combatants = draw_combatants_chart($scope);
  }
}

function draw_deaths_chart($scope)
{
  var deaths_by_cause = new Array(5);
  deaths_by_cause[0] = $scope.deaths_combat.length;
  deaths_by_cause[1] = $scope.deaths_murder.length;
  deaths_by_cause[2] = $scope.deaths_execution.length;
  deaths_by_cause[3] = $scope.deaths_illness.length;
  deaths_by_cause[4] = $scope.deaths_suicide.length;

  var cause_colors = new Array(5);
  cause_colors[0] = "#cc3333";
  cause_colors[1] = "#333333";
  cause_colors[2] = "#ff8800";
  cause_colors[3] = "#3388bb";
  cause_colors[4] = "#999999";

  var cause_labels = new Array(5);
  cause_labels[0] = { text: "Combat" };
  cause_labels[1] = { text: "Murder" };
  cause_labels[2] = { text: "Execution" };
  cause_labels[3] = { text: "Illness" };
  cause_labels[4] = { text: "Suicide" };

  var chart_deaths_by_cause = bar_horizontal("chart-deaths-by-cause", deaths_by_cause, cause_colors, cause_labels);
  window.addEventListener("resize", chart_deaths_by_cause.resized, false);

  return chart_deaths_by_cause;
}

function draw_combatants_chart($scope)
{
  var combatants = new Array($scope.combatants.length);
  for (var i in $scope.combatants)
  {
    combatants[i] = $scope.combatants[i].killed_combat.length;
  }

  var bar_colors = new Array(combatants.length);
  for (var i in combatants)
  {
    bar_colors[i] = "#77aadd";
  }

  var name_labels = new Array(combatants.length);
  for (var i in combatants)
  {
    name_labels[i] = { text: $scope.combatants[i].name, href: "/people/" + String($scope.combatants[i].id) };
  }

  var chart_top_combatants = bar_horizontal("chart-top-combatants", combatants, bar_colors, name_labels);
  window.addEventListener("resize", chart_top_combatants.resized, false);

  return chart_top_combatants;
}

function people_sort_by_kills(people)
{
  var sorted = people.slice();
  sorted.sort(function(a,b)
  {
    if (b.killed_combat.length == a.killed_combat.length)
    {
      // use alphabetical name sorting as tie-breaker
      if (a.name < b.name)
      {
        return -1;
      }
      else if (a.name > b.name)
      {
        return 1;
      }
      return 0;          
    }

    return b.killed_combat.length - a.killed_combat.length;
  });

  return sorted;
}
