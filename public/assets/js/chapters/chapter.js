// Controller for chapter.html.
function Chapter($scope, $http)
{
  // use the number at the end of the URL to determine which chapter's data to load
  chapter_num = document.URL.split("/").pop();

  // initial values of scope variables
  $scope.nav_chapters = [];
  $scope.last_chapter = 1;
  $scope.people_by_importance = [];
  
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;

  set_resize_handler_for("container-header");
  set_resize_handler_for("chart-area", true);
  set_resize_handler_for("stats-area");

  // issue an http get for the data relating to this chapter
  $http.get("/data/chapters").success(populate_chapter_info($scope, $http));
}

var populate_chapter_info = function($scope, $http, chapter_json)
{
  return function(data)
  {
    for (index in data.chapters)
    {
      var other_num = data.chapters[index].chapter

      // get the title text of this chapter
      if (other_num == chapter_num)
      {
        $scope.chapter = data.chapters[index];
      }

      // get neighboring chapters (this chapter and up to three chapters on either side)
      if (Math.abs(other_num - chapter_num) <= 3)
      {
        $scope.nav_chapters.push(data.chapters[index]);
      }

      // last chapter is the one with the largest number
      $scope.last_chapter = (other_num > $scope.last_chapter) ? other_num : $scope.last_chapter;
    }

    // chapter description
    document.title = "Chapter " + $scope.chapter.chapter + " - Viz3k";
    $scope.chapter_title = "Chapter " + $scope.chapter.chapter + " : " + $scope.chapter.title;

    // enable or disable prev and next chapter links depending on whether linked-to chapter exists
    $scope.prev_chapter = ($scope.chapter.chapter - 1 < 1) ? [] : [$scope.chapter.chapter - 1];
    $scope.prev_chapter_ = ($scope.chapter.chapter - 1 < 1) ? [0] : [];
    $scope.next_chapter = ($scope.chapter.chapter + 1 > $scope.last_chapter) ? [] : [$scope.chapter.chapter + 1];
    $scope.next_chapter_ = ($scope.chapter.chapter + 1 > $scope.last_chapter) ? [0] : [];

    // generate the coappearance visualization for the selected chapter
    chartCoappear("chart", "/data/coappear/chapter/" + chapter_num, compute_character_stats($scope));
  }
}

var compute_character_stats = function($scope, nodes, links)
{
  return function(nodes, links)
  {
    // calculate importance by sorting nodes by decreasing number of links
    nodes = sortNodesByLinks(nodes);
    people_style_parens(nodes);

    // get the top five
    top_five = nodes.slice(0,5);

    // death stats
    var deaths = $scope.chapter.deaths;
    $scope.deaths_combat = deaths_of_type(deaths, "combat");
    $scope.deaths_murder = deaths_of_type(deaths, "murder");
    $scope.deaths_execution = deaths_of_type(deaths, "execution");
    $scope.deaths_illness = deaths_of_type(deaths, "illness");
    $scope.deaths_suicide = deaths_of_type(deaths, "suicide");

    for (var d in deaths)
    {
      var death = deaths[d];
      for (var n in nodes)
      {
        if (nodes[n].id == death.id)
        {
          death.person = nodes[n];
        }
      }
      for (var k in death.killers)
      {
        for (var n in nodes)
        {
          if (nodes[n].id == death.killers[k])
          {
            death.killers[k] = nodes[n];
          }
        }
      }
    }

    $scope.people_by_importance = top_five;
    $scope.people = nodes;
    $scope.people_order = "name";
    $scope.deaths = deaths;

    // since this is an asynchronous handler, we need to let angular.js know we've updated a scope variable
    $scope.$apply();
  }
};
