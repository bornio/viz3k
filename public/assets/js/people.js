function People($scope, $http)
{
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 3;

  var populate_people = function(people_json)
  {
    var people = people_json.people;

    // add style name (if any) in parentheses
    people_style_parens(people);

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

      // set the scope variable after data is populated from both http queries
      $scope.people = people;
    }

    $http.get("/data/factions").success(populate_factions);
  }

  // get our data from the backend
  $http.get("/data/people").success(populate_people);
}
