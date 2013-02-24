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

// count faction members only if they actually appear as an affiliate of this faction in the selected chapter
function count_in_faction(faction, chapter)
{
  var member_count = 0;
  for (var m = 0; m < faction.members.length; m++)
  {
    var member = faction.members[m];
    var found_in_chapter = false;

    if (chapter.people.indexOf(member.id) >= 0)
    {
      // see if any of this member's intervals match this faction
      for (var i = 0; i < member.allegiance.length; i++)
      {
        var affiliation = member.allegiance[i];
        if (affiliation.faction == faction.id)
        {
          var interval_start = affiliation.interval[0];
          var interval_end = affiliation.interval[1];
          var chapter_start = chapter.pages[0];
          var chapter_end = chapter.pages[chapter.pages.length - 1];

          // see if this interval covers any part of the chapter
          if ((interval_start >= chapter_start && interval_start <= chapter_end) ||
              (interval_end >= chapter_start && interval_end <= chapter_end) ||
              (interval_start <= chapter_start && interval_end >= chapter_end))
          {
            // if so, then count this character as appearing in this chapter as a member of this faction
            found_in_chapter = true;
            break;
          }
        }
      }
    }

    if (found_in_chapter)
    {
      member_count++;
    }
  }

  return member_count;
}
