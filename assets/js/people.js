function People($scope, $http)
{
  // issue an http get to grab the data file
  $http.get("/data/characters.json").success(
    function(data)
    {
      // add style names in parentheses
      for (var i in data.people)
      {
        if ("style" in data.people[i])
        {
          data.people[i].style_paren = "(" + data.people[i].style + ")";
        }
        else
        {
          data.people[i].style_paren = "";
        }
      }

      $scope.people = data.people;
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
