// Controller for person.html.
function Person($scope, $http)
{
  // use the number at the end of the URL to determine which person's data to load
  person_id = document.URL.split("/").pop();

  // navbar settings
  $scope.navbar_url = "/navbar";
  $scope.navbar_selected = 3;

  // initial values
  $scope.style_parens = "";
  $scope.died = false;
  $scope.has_killers = false;
  $scope.kills = new Array();
  $scope.kills_combat = new Array();
  $scope.kills_murder = new Array();
  $scope.kills_execution = new Array();

  set_resize_handler_for("content-area", false);

  // issue an http get to grab the info for all people
  $http.get("/data/people").success(populate_person_info($scope, $http));
}

var populate_person_info = function($scope, $http, people_json)
{
  style_name_popover_title = "About style names"
  style_name_popover_content = "A <em><a href='http://en.wikipedia.org/wiki/Chinese_style_name'>style name</a></em>, or <em>courtesy name</em>, is a name traditionally given to Chinese males when they reach adulthood. Characters in the novel frequently address one another by their style names instead of their given names as a mark of respect.";
  return function(people_json)
  {
    var person = getPerson(people_json.people, person_id);

    // add parentheses to this person's style name
    personStyleParens(person);

    // add external links (if any) to a list
    person.links = [];
    if ("wiki" in person)
    {
      person.links.push({text:"wiki",href:person.wiki});
    }
    if ("km" in person)
    {
      person.links.push({text:"km",href:person.km});
    }

    // death information
    if ("death" in person)
    {
      death = person.death;
      $scope.died = true;
      if ("killers" in death)
      {
        $scope.has_killers = true;
        $scope.killers = killers_info(people_json.people, death.killers);
      }
    }

    $scope.person = person;
    document.title = person.name + " " + person.style_parens + " - Viz3k";

    if ("style_parens" in person)
    {
      $scope.style_parens = person.style_parens;

      // set a popover to explain style names
      $('#style-name').popover({ title: style_name_popover_title,
                                 content : style_name_popover_content });
    }

    // issue an http get to grab the faction info
    $http.get("/data/factions").success(populate_factions_info($scope, person));

    // get info for people killed by this person
    $http.get("/data/deaths/killed-by/" + person_id).success(populate_kills_info($scope, person_id));
  }
}

function populate_factions_info($scope, person, factions_json)
{
  return function(factions_json)
  {
    // find this person's faction info
    var primary_faction;
    var other_factions = new Array();
    for (var f in factions_json.factions)
    {
      var faction = factions_json.factions[f];

      // primary faction
      if (faction.id == person.faction)
      {
        primary_faction = faction;
        labelFactionType(primary_faction);
      }

      // other affiliations
      for (var a in person.allegiance)
      {
        var affiliation = person.allegiance[a];
        if ((affiliation.faction != person.faction) &&
            (affiliation.faction == faction.id))
        {
          labelFactionType(faction);
          other_factions.push(faction);
        }
      }
    }

    // assign data to the scope
    $scope.primary_faction = primary_faction;
    $scope.other_factions = other_factions;
  }
}

function populate_kills_info($scope, person_id, kills_json)
{
  return function(kills_json)
  {
    var kills = kills_json.killed_by;
    if (kills.length > 0)
    {
      $scope.kills = kills;
    }

    $scope.kills_combat = kills_of_type(kills, "combat");
    $scope.kills_murder = kills_of_type(kills, "murder");
    $scope.kills_execution = kills_of_type(kills, "execution");
  }
}

function killers_info(people, killers)
{
  var info = new Array();
  for (k in killers)
  {
    var killer_info = getPerson(people, killers[k]);
    info.push(killer_info);
  }

  return info;
}
