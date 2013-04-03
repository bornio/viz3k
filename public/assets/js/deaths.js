function Deaths($scope, $http)
{
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;

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
    cause_colors[4] = "#666666";

    var cause_labels = new Array(5);
    cause_labels[0] = "Combat";
    cause_labels[1] = "Murder";
    cause_labels[2] = "Execution";
    cause_labels[3] = "Illness";
    cause_labels[4] = "Suicide";

    var chart_deaths_by_cause = bar_horizontal("chart-deaths-by-cause", deaths_by_cause, cause_colors, cause_labels);

    window.addEventListener("resize", chart_deaths_by_cause.resized, false);
  }
}
