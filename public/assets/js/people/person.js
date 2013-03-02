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

    // add external links (if any) to a list
    person.links = [];
    if ("wiki" in person)
    {
      person.links.push({text:"wiki",href:person.wiki});
    }

    var populate_factions_info = function(factions)
    {
      // find this person's faction info
      var primary_faction;
      var other_factions = new Array();
      for (var f in factions.factions)
      {
        var faction = factions.factions[f];

        // primary faction
        if (faction.id == person.faction)
        {
          primary_faction = faction;
          label_faction_type(primary_faction);
        }

        // other affiliations
        for (var a in person.allegiance)
        {
          var affiliation = person.allegiance[a];
          if ((affiliation.faction != person.faction) &&
              (affiliation.faction == faction.id))
          {
            label_faction_type(faction);
            other_factions.push(faction);
          }
        }
      }

      // assign data to the scope
      $scope.primary_faction = primary_faction;
      $scope.other_factions = other_factions;
      console.log(other_factions);
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
