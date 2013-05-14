function FactionController($scope, $http, $q) {
  // use the number at the end of the URL to determine which faction's data to load
  factionNum = document.URL.split("/").pop();

  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbar_selected = 2;

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

  // per-chapter stats
  chartFactionAppearances(faction, chapters);
}

function chartFactionAppearances(faction, chapters) {
  var factions = new Array();

  faction.chapters = new Array(chapters.length);

  // find out how many of this faction's members turn up in each chapter
  var maxPeople = 0;
  for (var c = 0; c < chapters.length; c++) {
    var chapter = chapters[c];
    faction.chapters[c] = countFactionMembersInChapter(faction, chapter);
    if (faction.chapters[c] > maxPeople) {
      maxPeople = faction.chapters[c];
    }
  }

  factions.push(faction);

  // use jQuery to redraw the chart each time the tab is selected
  var chart = null;
  var activeTab = null;
  $('a[data-toggle="tab"]').on('shown', function (e) {
    activeTab = e.target;
    if (activeTab.hash == "#stats") {
      // display a stacked bar chart of faction appearances per chapter
      if (chart == null) {
        chart = chartAppearanceTimeline("chart-appearances", factions, chapters, maxPeople);
      }
      
      // add window resize event for the chart
      window.addEventListener("resize", chart.resized, false);
    } else {
      // remove the resize event if needed
      if (chart != null) {
        window.removeEventListener("resize", chart.resized, false);
      }
    }
  })
}
