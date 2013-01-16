function Factions($scope, $http)
{
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;

  // issue an http get to grab the data file
  $http.get("/factions/data/all-factions").success(
    function(data)
    {
      $scope.factions = data.factions;

      // keep the "Other" faction (id = 99) separate
      for (var i = 0; i < $scope.factions.length; i++)
      {
        if ($scope.factions[i].id == 99)
        {
          $scope.factions_other = [$scope.factions[i]];
          $scope.factions.splice(i,1);
        }
      }

      // sort the factions
      $scope.factions = factions_sort_by_size($scope.factions);
    }
  );
}

function factions_sort_by_size(factions)
{
  var sorted = factions.slice();
  sorted.sort(function(a,b)
  {
    // use alphabetical name sorting as tie-breaker
    if (b.size == a.size)
    {
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

    return b.size - a.size;
  });

  return sorted;
}
