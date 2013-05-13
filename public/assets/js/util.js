// count faction members only if they actually appear as an affiliate of this faction in the selected chapter
function countFactionMembersInChapter(faction, chapter) {
  var memberCount = 0;
  for (var m = 0; m < faction.members.length; m++) {
    var member = faction.members[m];
    var foundInChapter = false;

    if (chapter.people.indexOf(member.id) >= 0) {
      // count this person if they are affiliated with this faction in this chapter
      if (isFactionMemberInChapter(member, faction, chapter)) {
        memberCount++;
      }
    }
  }

  return memberCount;
}

function isFactionMemberInChapter(person, faction, chapter) {
  for (var i = 0; i < person.allegiance.length; i++) {
    var affiliation = person.allegiance[i];
    if (affiliation.faction == faction.id) {
      var intervalStart = affiliation.interval[0];
      var intervalEnd = affiliation.interval[1];
      var chapterStart = chapter.pages[0];
      var chapterEnd = chapter.pages[chapter.pages.length - 1];

      // see if this interval covers any part of the chapter
      if ((intervalStart >= chapterStart && intervalStart <= chapterEnd) ||
          (intervalEnd >= chapterStart && intervalEnd <= chapterEnd) ||
          (intervalStart <= chapterStart && intervalEnd >= chapterEnd)) {
        // if so, then this character is a member of this faction during this chapter
        return true;
      }
    }
  }

  return false;
}

// find and return the person with the given id
function getPerson(people, id) {
  for (var p in people)
  {
    if (people[p].id == id)
    {
      return people[p];
    }
  }

  return nil;
}

// add a parenthesized version of a person's style name if they have one
function personStyleParens(person) {
  if ("style" in person)
  {
    person.style_parens = "(" + person.style + ")";
  }
  else
  {
    person.style_parens = "";
  }
}

// given an array of people, add a parenthesized version of each person's style name if they have one
function peopleStyleParens(people) {
  for (var i in people)
  {
    personStyleParens(people[i]);
  }
}

// add a parenthesized verson of a faction's type if it has one
function labelFactionType(faction) {
  if (faction.type != "faction")
  {
    faction.type_label = "(" + faction.type + ")";
  }
  else
  {
    faction.type_label = "";
  }
}

// returns indices of killed-by records that match the given cause of death
function killsOfType(kills, death_type) {
  var kill_indices = new Array();

  for (var d in kills)
  {
    var death = kills[d].death;
    if (("cause" in death) && (death.cause == death_type))
    {
      kill_indices.push(d);
    }
  }

  return kill_indices;
}

// returns indices of death records that match the given cause of death
function deathsOfType(deaths, death_type) {
  var death_indices = new Array();

  for (var d in deaths)
  {
    var death = deaths[d];
    if (("cause" in death) && (death.cause == death_type))
    {
      death_indices.push(d);
    }
  }

  return death_indices;
}

function setResizeHandlerFor(element_id, hidden_phone) {
  // default values
  if (typeof(hidden_phone) === 'undefined')
  {
    hidden_phone = false;
  }

  var element = document.getElementById(element_id);

  var window_resize = function()
  {
    var class_name = (hidden_phone) ? "hidden-phone " : "";
    if (document.body.clientWidth < 980)
    {
      class_name += "span12";
    }
    else if (document.body.clientWidth < 1200)
    {
      class_name += "span10";
    }
    else
    {
      class_name += "span8 offset2";
    }

    element.className = class_name;
  }

  window_resize();

  window.addEventListener("resize", window_resize, false);
}
