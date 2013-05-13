// Controller for chapter.html.
function ChapterController($scope, $http) {
  // use the number at the end of the URL to determine which chapter's data to load
  chapterNum = document.URL.split("/").pop();

  // initial values of scope variables
  $scope.navChapters = [];
  $scope.lastChapter = 1;
  $scope.peopleByImportance = [];
  
  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbar_selected = 1;

  setResizeHandlerFor("container-header");
  setResizeHandlerFor("chart-area", true);
  setResizeHandlerFor("stats-area");

  // issue an http get for the data relating to this chapter
  $http.get("/data/chapters").success(populateChapterInfo($scope, $http));
}

var populateChapterInfo = function($scope, $http, chapterJson) {
  return function(data) {
    for (var index in data.chapters) {
      var otherNum = data.chapters[index].chapter

      // get the title text of this chapter
      if (otherNum == chapterNum) {
        $scope.chapter = data.chapters[index];
      }

      // get neighboring chapters (this chapter and up to three chapters on either side)
      if (Math.abs(otherNum - chapterNum) <= 3) {
        $scope.navChapters.push(data.chapters[index]);
      }

      // last chapter is the one with the largest number
      $scope.lastChapter = (otherNum > $scope.lastChapter) ? otherNum : $scope.lastChapter;
    }

    // chapter description
    document.title = "Chapter " + $scope.chapter.chapter + " - Viz3k";
    $scope.chapterTitle = "Chapter " + $scope.chapter.chapter + " : " + $scope.chapter.title;

    // enable or disable prev and next chapter links depending on whether linked-to chapter exists
    $scope.prevChapter = ($scope.chapter.chapter - 1 < 1) ? [] : [$scope.chapter.chapter - 1];
    $scope.prevChapter_ = ($scope.chapter.chapter - 1 < 1) ? [0] : [];
    $scope.nextChapter = ($scope.chapter.chapter + 1 > $scope.lastChapter) ? [] : [$scope.chapter.chapter + 1];
    $scope.nextChapter_ = ($scope.chapter.chapter + 1 > $scope.lastChapter) ? [0] : [];

    // generate the coappearance visualization for the selected chapter
    chartCoappear("chart", "/data/coappear/chapter/" + chapterNum, computeCharacterStats($scope));
  }
}

var computeCharacterStats = function($scope, nodes, links) {
  return function(nodes, links) {
    // calculate importance by sorting nodes by decreasing number of links
    nodes = sortNodesByLinks(nodes);
    peopleStyleParens(nodes);

    // get the top five
    var topFive = nodes.slice(0,5);

    // death stats
    var deaths = $scope.chapter.deaths;
    $scope.deathsCombat = deathsOfType(deaths, "combat");
    $scope.deathsMurder = deathsOfType(deaths, "murder");
    $scope.deathsExecution = deathsOfType(deaths, "execution");
    $scope.deathsIllness = deathsOfType(deaths, "illness");
    $scope.deathsSuicide = deathsOfType(deaths, "suicide");

    for (var d in deaths) {
      var death = deaths[d];
      for (var n in nodes) {
        if (nodes[n].id == death.id) {
          death.person = nodes[n];
        }
      }
      for (var k in death.killers) {
        for (var n in nodes) {
          if (nodes[n].id == death.killers[k]) {
            death.killers[k] = nodes[n];
          }
        }
      }
    }

    $scope.peopleByImportance = topFive;
    $scope.people = nodes;
    $scope.peopleOrder = "name";
    $scope.deaths = deaths;

    // since this is an asynchronous handler, we need to let angular.js know we've updated a scope variable
    $scope.$apply();
  }
};
