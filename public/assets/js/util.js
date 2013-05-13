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
  for (var p in people) {
    if (people[p].id == id) {
      return people[p];
    }
  }

  return nil;
}

// add a parenthesized version of a person's style name if they have one
function personStyleParens(person) {
  if ("style" in person) {
    person.style_parens = "(" + person.style + ")";
  } else {
    person.style_parens = "";
  }
}

// given an array of people, add a parenthesized version of each person's style name if they have one
function peopleStyleParens(people) {
  for (var i in people) {
    personStyleParens(people[i]);
  }
}

// add a parenthesized verson of a faction's type if it has one
function labelFactionType(faction) {
  if (faction.type != "faction") {
    faction.type_label = "(" + faction.type + ")";
  } else {
    faction.type_label = "";
  }
}

// returns indices of killed-by records that match the given cause of death
function killsOfType(kills, deathType) {
  var killIndices = new Array();

  for (var d in kills) {
    var death = kills[d].death;
    if (deathIsOfType(death, deathType)) {
      killIndices.push(d);
    }
  }

  return killIndices;
}

// returns indices of death records that match the given cause of death
function deathsOfType(deaths, deathType) {
  var deathIndices = new Array();

  for (var d in deaths) {
    var death = deaths[d];
    if (deathIsOfType(death, deathType)) {
      deathIndices.push(d);
    }
  }

  return deathIndices;
}

function deathIsOfType(death, deathType) {
  return (("cause" in death) && (death.cause == deathType));
}

function setResizeHandlerFor(elementId, hiddenPhone) {
  // default values
  if (typeof(hiddenPhone) === 'undefined') {
    hiddenPhone = false;
  }

  var element = document.getElementById(elementId);

  var windowResize = function() {
    var className = (hiddenPhone) ? "hidden-phone " : "";
    if (document.body.clientWidth < 980) {
      className += "span12";
    } else if (document.body.clientWidth < 1200) {
      className += "span10";
    } else {
      className += "span8 offset2";
    }

    element.className = className;
  }

  windowResize();

  window.addEventListener("resize", windowResize, false);
}
