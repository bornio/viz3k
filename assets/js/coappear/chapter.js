function Chapter($scope, $http)
{
  // use the number at the end of the URL to determine which chapter's data to load
  var chapter_id = document.URL.split("/").pop();

  // issue an http get to grab the chapter descriptions
  $http.get("/data/chapters.json").success(
    function(data)
    {
      for (index in data.chapters)
      {
        if (data.chapters[index].chapter == chapter_id)
        {
          $scope.chapter = data.chapters[index];
        }
      }
    }
  );

  // generate the coappearance visualization for the selected chapter
  coappear("/coappear/data/chapter" + chapter_id + ".json");
}
