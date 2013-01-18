function ChapterList($scope, $http)
{
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;
  
  // issue an http get to grab the data file
  $http.get("/data/chapters").success(
    function(data)
    {
      $scope.chapters = data.chapters;
    }
  );

  // default ordering of chapters list is by chapter number
  $scope.orderProp = "chapter";
}
