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

    // add parentheses to all style names
    for (var i in faction.members)
    {
      if ("style" in faction.members[i])
      {
        faction.members[i].style_paren = "(" + faction.members[i].style + ")";
      }
      else
      {
        faction.members[i].style_paren = "";
      }
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
        faction.chapters[c] = count_in_faction(faction, chapter);
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

  // issue an http get to grab the info for this faction
  $http.get("/data/factions/" + faction_num).success(populate_faction_info);
}
