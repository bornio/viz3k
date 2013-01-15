function Chapter($scope, $http)
{
  // use the number at the end of the URL to determine which chapter's data to load
  chapter_num = document.URL.split("/").pop();

  // initial values of scope variables
  $scope.nav_chapters = [];
  $scope.last_chapter = 1;
  $scope.people_by_importance = [];

  // issue an http get to grab the chapter descriptions and populate the navigation links
  $http.get("/data/chapters.json").success(
    function(data)
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
      $scope.chapter_title = "Chapter " + $scope.chapter.chapter + " : " + $scope.chapter.title;

      // enable or disable prev and next chapter links depending on whether linked-to chapter exists
      $scope.prev_chapter = ($scope.chapter.chapter - 1 < 1) ? [] : [$scope.chapter.chapter - 1];
      $scope.prev_chapter_ = ($scope.chapter.chapter - 1 < 1) ? [0] : [];
      $scope.next_chapter = ($scope.chapter.chapter + 1 > $scope.last_chapter) ? [] : [$scope.chapter.chapter + 1];
      $scope.next_chapter_ = ($scope.chapter.chapter + 1 > $scope.last_chapter) ? [0] : [];
    }
  );

  // issue an http get to grab the info on each character

  // callback to get data back from asynchronous load
  var compute_stats = function(nodes, links) {
    // calculate importance by sorting nodes by decreasing number of links
    nodes = nodes_sort_by_links(nodes);

    // get the top five
    top_five = nodes.slice(0,5);

    for (var i in top_five)
    {
      if ("style" in top_five[i])
      {
        top_five[i].style_paren = "(" + top_five[i].style + ")";
      }
      else
      {
        top_five[i].style_paren = "";
      }
    }

    $scope.people_by_importance = top_five;

    // since this is an asynchronous handler, we need to let angular.js know we've updated a scope variable
    $scope.$apply();
  };

  // generate the coappearance visualization for the selected chapter
  coappear("/coappear/data/chapter/" + chapter_num, compute_stats);
}
