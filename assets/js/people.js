function People($scope, $http)
{
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;
  $scope.people_order = "num_appearances";
  $scope.people_order_invert = true;

  var populate_people = function(people_json)
  {
    var people = people_json.people;

    // add style names in parentheses
    for (var i in people)
    {
      if ("style" in people[i])
      {
        people[i].style_paren = "(" + people[i].style + ")";
      }
      else
      {
        people[i].style_paren = "";
      }
    }

    var populate_factions = function(factions_json)
    {
      var factions = factions_json.factions;

      // add faction data to people
      for (var p in people)
      {
        for (var f in factions)
        {
          if (people[p].faction == factions[f].id)
          {
            people[p].faction_name = factions[f].name;
            people[p].faction_type = factions[f].type;
            people[p].faction_color = factions[f].color;
          }
        }
      }
    }

    $http.get("/data/factions.json").success(populate_factions);

    $scope.people = people;
  }

  // get our data from the backend
  $http.get("/people/data/num-appearances").success(populate_people);
}
