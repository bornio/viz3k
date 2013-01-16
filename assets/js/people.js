function People($scope, $http)
{
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;

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
