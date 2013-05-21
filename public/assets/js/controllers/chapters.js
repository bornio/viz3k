function ChaptersController($scope, $http) {
  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbarSelected = 1;

  // default ordering of chapters list is by chapter number
  $scope.orderProp = "chapter";

  // issue an http get to grab the data file
  var promise = $http.get("/data/chapters");
  promise.then(function(results) {
    renderView($scope, results.data.chapters);
  });
}

var renderView = function($scope, chapters) {
  $scope.chapters = chapters;
}
