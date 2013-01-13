function Chapter($scope, $http)
{
  // use the number at the end of the URL to determine which chapter's data to load
  chapter_num = document.URL.split("/").pop();

  // issue an http get to grab the chapter descriptions and populate the navigation links
  $http.get("/data/chapters.json").success(
    function(data)
    {
      $scope.nav_chapters = [];
      $scope.last_chapter = 1;

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
      $scope.next_chapter = ($scope.chapter.chapter + 1 > $scope.last_chapter) ? [] : [$scope.chapter.chapter + 1];
    }
  );

  // generate the coappearance visualization for the selected chapter
  coappear("/coappear/data/chapter" + chapter_num + ".json");
}
