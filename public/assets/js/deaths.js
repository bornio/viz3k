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
  }
}
