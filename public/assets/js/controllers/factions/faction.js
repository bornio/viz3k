function FactionController($scope, $http, $q) {
  // use the number at the end of the URL to determine which faction's data to load
  factionNum = document.URL.split("/").pop();

  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbarSelected = 2;

  // get our data from the backend
  var promises = [$http.get("/data/factions/" + factionNum), $http.get("/data/chapters")];
  $q.all(promises).then(function(results) {
    var faction = results[0].data;
    var chapters = results[1].data.chapters;

    // we have all the data we need
    renderView($scope, faction, chapters);
  });
}

function renderView($scope, faction, chapters) {
  // this is so we don't momentarily see "()" by itself before the text loads asynchronously
  $scope.factionType = "(" + faction.type + ")";
  $scope.factionLinks = [];
  if ("wiki" in faction) {
    $scope.factionLinks.push({ text:"wiki", href:faction.wiki });
  }

  // add parentheses to all style names
  peopleStyleParens(faction.members);

  // assign data to the scope
  $scope.faction = faction;
  document.title = $scope.faction.name + " " + $scope.factionType + " - Viz3k";

  // streamgraph for this faction
  chartFactionsStream()
    .factions([faction])
    .chapters(chapters)
    .style('stack')
    .render("#chart-faction");
}
