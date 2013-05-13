function FactionController($scope, $http) {
  // use the number at the end of the URL to determine which faction's data to load
  factionNum = document.URL.split("/").pop();

  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbar_selected = 2;

  var populateFactionInfo = function(faction) {
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
    var populateChartTab = function(chaptersData) {
      chartFactionAppearances(faction, chaptersData);
    }

    // issue an http get to grab the chapters info for the faction appearance timeline
    $http.get("/data/chapters").success(populateChartTab);
  }

  // issue an http get to grab the info for this faction
  $http.get("/data/factions/" + factionNum).success(populateFactionInfo);
}

function chartFactionAppearances(faction, chaptersData) {
  chapters = chaptersData.chapters;
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
