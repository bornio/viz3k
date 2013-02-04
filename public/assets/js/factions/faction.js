function Faction($scope, $http)
{
  // use the number at the end of the URL to determine which faction's data to load
  faction_num = document.URL.split("/").pop();

  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;

  var populate_faction_info = function(faction)
  {
    // this is so we don't momentarily see "()" by itself before the text loads asynchronously
    $scope.faction_type = "(" + faction.type + ")";
    $scope.faction_links = [];
    if ("wiki" in faction)
    {
      $scope.faction_links.push({text:"wiki",href:faction.wiki});
    }

    // add per-chapter stats to each faction
    var populate_timeline = function(chapters_data)
    {
      chapters = chapters_data.chapters;
      var factions = new Array();

      // see what the max number of distinct characters to appear in any chapter is
      for (var c = 0; c < chapters.length; c++)
      {
        if (chapters[c].people.length > max_people)
        {
          max_people = chapters[c].people.length;
        }
      }

      faction.chapters = new Array(chapters.length);

      // find out how many of this faction's members turn up in each chapter
      var max_people = 0;
      for (var c = 0; c < chapters.length; c++)
      {
        var chapter = chapters[c];
        faction.chapters[c] = count_in_faction(faction, chapter.people);
        if (faction.chapters[c] > max_people)
        {
          max_people = faction.chapters[c];
        }
      }

      factions.push(faction);
      
      // display a stacked bar chart of faction appearances per chapter
      appearance_timeline("chart-appearances", factions, chapters, max_people);

      // assign data to the scope
      $scope.faction = faction;
    }

    // issue an http get to grab the chapters info for the faction appearance timeline
    $http.get("/data/chapters").success(populate_timeline);
  }

  var populate_member_info = function(members)
  {
    for (var i in members.members)
    {
      if ("style" in members.members[i])
      {
        members.members[i].style_paren = "(" + members.members[i].style + ")";
      }
      else
      {
        members.members[i].style_paren = "";
      }
    }

    $scope.faction_members = members.members;
  }

  // issue an http get to grab the info for this faction
  $http.get("/data/factions/" + faction_num).success(populate_faction_info);

  // issue an http get to grab the member info for this faction
  $http.get("/data/factions/" + faction_num + "/members").success(populate_member_info);
}

function count_in_faction(faction, people_ids)
{
  var member_count = 0;
  for (var p = 0; p < people_ids.length; p++)
  {
    var person_id = people_ids[p];
    if (faction.members.indexOf(person_id) >= 0)
    {
      member_count += 1;
    }
  }

  return member_count;
}
