function Factions($scope, $http)
{
  // issue an http get to grab the data file
  $http.get("/factions/data/all-factions").success(
    function(data)
    {
      $scope.factions = data.factions;

      // keep the "Other" faction (id = 99) separate
      for (var i = 0; i < data.factions.length; i++)
      {
        if (data.factions[i].id == 99)
        {
          $scope.factions_other = [data.factions[i]];
          $scope.factions.splice(i,1);
        }
      }
      scope.$apply();
    }
  );
}
