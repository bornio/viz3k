function ChapterList($scope, $http)
{
  // issue an http get to grab the data file
  $http.get("/data/chapters.json").success(
    function(data)
    {
      $scope.chapters = data.chapters;
    }
  );

  // default ordering of chapters list is by chapter number
  $scope.orderProp = "chapter";
}
