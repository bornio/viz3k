function ChapterList($scope, $http)
{
  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 1;

  var populate_chapters = function(data)
  {
    $scope.chapters = data.chapters;
  }
  
  // issue an http get to grab the data file
  $http.get("/data/chapters").success(populate_chapters);

  // default ordering of chapters list is by chapter number
  $scope.orderProp = "chapter";
}
