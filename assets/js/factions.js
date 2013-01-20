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

    // add per-chapter stats to each faction
    var populate_chapters = function(chapters_data)
    {
      chapters = chapters_data.chapters;
      var faction_chapter_stats = new Array(factions.length);
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
          faction.chapters[c] = in_faction(faction, chapter.people);
        }
      }
      
      // display a stacked bar chart of faction appearances per chapter
      chart_appearances(factions, chapters, max_people);

      // assign data to the scope
      $scope.factions = factions;
      $scope.factions_other = factions_other;
    }

    // issue an http get to grab the data file
    $http.get("/data/chapters").success(populate_chapters);
  }

  // issue an http get to grab the data file
  $http.get("/data/factions").success(populate_factions);
}

function in_faction(faction, people_ids)
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

function chart_appearances(factions, chapters, max_people)
{
  // append the svg element for drawing the chart on
  var svg = d3.select("#chart-appearances").append("svg").attr("class", "chart-appearances");
  var chart_initialized = false;
  var svg_height = document.getElementById("chart-appearances").clientHeight;
  var y_range = d3.scale.linear()
    .domain([0, max_people])
    .range([0, svg_height]);

  // create a bar group for every faction
  for (var f = 0; f < factions.length; f++)
  {
    var faction = factions[f];
    svg.append("g").attr("id", "faction" + String(faction.id));
  }

  // render or resize the chart as needed
  var chart_resize = function()
  {
    var svg_width = document.getElementById("chart-appearances").clientWidth;
    var bar_width = svg_width/chapters.length;

    var y_offsets = new Array(chapters.length);
    for (var c = 0; c < chapters.length; c++)
    {
      y_offsets[c] = 0;
    }

    // create color-coded bars for every faction
    for (var f = 0; f < factions.length; f++)
    {
      var faction = factions[f];
      var bars = svg.select("#faction" + String(faction.id)).selectAll("rect").data(faction.chapters);

      if (!chart_initialized)
      {
        bars.enter().append("rect");
      }

      bars.attr("x", function(d, i) { return bar_width*i; })
          .attr("y", function(d, i) { return svg_height - y_range(d) - y_offsets[i]; })
          .attr("width", bar_width)
          .attr("height", y_range)
          .style("fill", function(d) { return faction.color; });

      // update offsets
      for (var c = 0; c < chapters.length; c++)
      {
        y_offsets[c] += y_range(faction.chapters[c]);
      }
    }

    chart_initialized = true;
  }

  // call chart_resize() to draw the chart for the first time
  chart_resize();

  window.addEventListener("resize", chart_resize, false);
}
