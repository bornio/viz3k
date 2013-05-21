// Controller for person.html.
function PersonController($scope, $http, $q) {
  // use the number at the end of the URL to determine which person's data to load
  personId = document.URL.split("/").pop();

  // navbar settings
  $scope.navbarUrl = "/navbar";
  $scope.navbarSelected = 3;

  // initial values
  $scope.styleParens = "";
  $scope.died = false;
  $scope.hasKillers = false;
  $scope.kills = new Array();
  $scope.killsCombat = new Array();
  $scope.killsMurder = new Array();
  $scope.killsExecution = new Array();

  setResizeHandlerFor("content-area", false);

  // get our data from the backend
  var promises = [$http.get("/data/people"),
                  $http.get("/data/factions"),
                  $http.get("/data/deaths/killed-by/" + personId)];
  $q.all(promises).then(function(results) {
    var people = results[0].data.people;
    var factions = results[1].data.factions;
    var kills = results[2].data.killed_by;

    // we have all the data we need
    renderView($scope, people, factions, kills);
  });
}

function renderView($scope, people, factions, kills) {
  // add parentheses to this person's style name
  var person = getPerson(people, personId);
  personStyleParens(person);
  styleNamePopoverTitle = "About style names"
  styleNamePopoverContent = "A <em><a href='http://en.wikipedia.org/wiki/Chinese_style_name'>style name</a></em>, or <em>courtesy name</em>, is a name traditionally given to Chinese males when they reach adulthood. Characters in the novel frequently address one another by their style names instead of their given names as a mark of respect.";

  // add external links (if any) to a list
  person.links = [];
  if ("wiki" in person) {
    person.links.push({ text:"wiki", href:person.wiki });
  }
  if ("km" in person) {
    person.links.push({ text:"km", href:person.km });
  }

  // death information
  if ("death" in person) {
    death = person.death;
    $scope.died = true;
    if ("killers" in death) {
      $scope.hasKillers = true;
      $scope.killers = killersInfo(people, death.killers);
    }
  }

  $scope.person = person;
  document.title = person.name + " " + person.style_parens + " - Viz3k";

  if ("style_parens" in person) {
    $scope.styleParens = person.style_parens;

    // set a popover to explain style names
    $('#style-name').popover({ title: styleNamePopoverTitle, content : styleNamePopoverContent });
  }

  // find this person's faction info
  var primaryFaction;
  var otherFactions = new Array();
  for (var f in factions)
  {
    var faction = factions[f];

    // primary faction
    if (faction.id == person.faction) {
      primaryFaction = faction;
      labelFactionType(primaryFaction);
    }

    // other affiliations
    for (var a in person.allegiance) {
      var affiliation = person.allegiance[a];
      if ((affiliation.faction != person.faction) &&
          (affiliation.faction == faction.id)) {
        labelFactionType(faction);
        otherFactions.push(faction);
      }
    }
  }

  // assign data to the scope
  $scope.primaryFaction = primaryFaction;
  $scope.otherFactions = otherFactions;

  if (kills.length > 0) {
    $scope.kills = kills;
  }

  $scope.killsCombat = killsOfType(kills, "combat");
  $scope.killsMurder = killsOfType(kills, "murder");
  $scope.killsExecution = killsOfType(kills, "execution");
}

function killersInfo(people, killers) {
  var info = new Array();
  for (var k in killers) {
    var killerInfo = getPerson(people, killers[k]);
    info.push(killerInfo);
  }

  return info;
}
