function Person($scope, $http)
{
  // use the number at the end of the URL to determine which person's data to load
  person_id = document.URL.split("/").pop();

  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;

  // initial values
  $scope.style_label = "";
  $scope.style_text = "";

  var populate_person_info = function(person)
  {
    // add parentheses to this person's style name
    person_style_parens(person);

    console.log(person);

    // add external links (if any) to a list
    person.links = [];
    if ("wiki" in person)
    {
      person.links.push({text:"wiki",href:person.wiki});
    }

    var populate_factions_info = function(factions)
    {
      var primary_faction;
      for (var f in factions.factions)
      {
        var faction = factions.factions[f];
        if (faction.id == person.faction)
        {
          // for non-generic faction types, label the type in parentheses
          if (faction.type != "faction")
          {
            faction.type_label = "(" + faction.type + ")";
          }
          else
          {
            faction.type_label = "";
          }

          primary_faction = faction;
          break;
        }
      }

      // assign data to the scope
      $scope.primary_faction = primary_faction;
      $scope.person = person;

      if ("style" in person)
      {
        $scope.style_label = "Style name:";
        $scope.style_text = person.style;
      }
    }

    // issue an http get to grab the faction info
    $http.get("/data/factions").success(populate_factions_info);
  }

  // issue an http get to grab the info for this person
  $http.get("/data/people/" + person_id).success(populate_person_info);
}
