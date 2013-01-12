function Chapter($scope, $http)
{
  // use the number at the end of the URL to determine which chapter's data to load
  $scope.chapter = document.URL.split("/").pop();
  coappear("/coappear/data/chapter" + $scope.chapter + ".json");
}
