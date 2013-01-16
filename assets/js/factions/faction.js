function Faction($scope, $http)
{
  // use the number at the end of the URL to determine which faction's data to load
  faction_num = document.URL.split("/").pop();

  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;

  var populate_faction_info = function(faction)
  {
    $scope.faction = faction;
  }

  var populate_member_info = function(members)
  {
    for (var i in members.people)
    {
      if ("style" in members.people[i])
      {
        members.people[i].style_paren = "(" + members.people[i].style + ")";
      }
      else
      {
        members.people[i].style_paren = "";
      }
    }

    $scope.faction_members = members.people;
  }

  // issue an http get to grab the info for this faction
  $http.get("/factions/data/" + faction_num + "/info").success(populate_faction_info);

  // issue an http get to grab the member info for this faction
  $http.get("/factions/data/" + faction_num + "/members").success(populate_member_info);
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
