function Factions($scope, $http)
{
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;

  var populate_factions = function(factions_data)
  {
    factions = factions_data.factions;

    for (var i = 0; i < factions.length; i++)
    {
      // for non-generic faction types, label the type in parentheses
      if (factions[i].type != "faction")
      {
        factions[i].type_label = "(" + factions[i].type + ")";
      }
      else
      {
        factions[i].type_label = "";
      }

      // keep the "Other" faction (id = 99) separate
      if (factions[i].id == 99)
      {
        factions_other = [factions[i]];
        factions.splice(i,1);
      }
    }

    // sort the factions
    factions = factions_sort_by_size(factions);

    // add timeline showing appearances for all factions
    var populate_timeline = function(chapters_data)
    {
      chapters = chapters_data.chapters;
      var max_people = 0;

      // see what the max number of distinct characters to appear in any chapter is
      for (var c = 0; c < chapters.length; c++)
      {
        if (chapters[c].people.length > max_people)
        {
          max_people = chapters[c].people.length;
        }
      }

      // for each faction...
      for (var f = 0; f < factions.length; f++)
      {
        var faction = factions[f];
        faction.chapters = new Array(chapters.length);

        // find out how many of its members turn up in each chapter
        for (var c = 0; c < chapters.length; c++)
        {
          var chapter = chapters[c];
          faction.chapters[c] = count_in_faction(faction, chapter.people);
        }
      }
      
      // display a stacked bar chart of faction appearances per chapter
      appearance_timeline("chart-appearances", factions, chapters, max_people);

      // assign data to the scope
      $scope.factions = factions;
      $scope.factions_other = factions_other;
    }

    // issue an http get to grab the data file
    $http.get("/data/chapters").success(populate_timeline);
  }

  // issue an http get to grab the data file
  $http.get("/data/factions").success(populate_factions);
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

function factions_sort_by_size(factions)
{
  var sorted = factions.slice();
  sorted.sort(function(a,b)
  {
    // use alphabetical name sorting as tie-breaker
    if (b.members.length == a.members.length)
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

    return b.members.length - a.members.length;
  });

  return sorted;
}
