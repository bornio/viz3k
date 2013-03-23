// count faction members only if they actually appear as an affiliate of this faction in the selected chapter
function count_in_faction(faction, chapter)
{
  var member_count = 0;
  for (var m = 0; m < faction.members.length; m++)
  {
    var member = faction.members[m];
    var found_in_chapter = false;

    if (chapter.people.indexOf(member.id) >= 0)
    {
      // see if any of this member's intervals match this faction
      for (var i = 0; i < member.allegiance.length; i++)
      {
        var affiliation = member.allegiance[i];
        if (affiliation.faction == faction.id)
        {
          var interval_start = affiliation.interval[0];
          var interval_end = affiliation.interval[1];
          var chapter_start = chapter.pages[0];
          var chapter_end = chapter.pages[chapter.pages.length - 1];

          // see if this interval covers any part of the chapter
          if ((interval_start >= chapter_start && interval_start <= chapter_end) ||
              (interval_end >= chapter_start && interval_end <= chapter_end) ||
              (interval_start <= chapter_start && interval_end >= chapter_end))
          {
            // if so, then count this character as appearing in this chapter as a member of this faction
            found_in_chapter = true;
            break;
          }
        }
      }
    }

    if (found_in_chapter)
    {
      member_count++;
    }
  }

  return member_count;
}

// add a parenthesized version of a person's style name if they have one
function person_style_parens(person)
{
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
function people_style_parens(people)
{
  for (var i in people)
  {
    person_style_parens(people[i]);
  }
}

// add a parenthesized verson of a faction's type if it has one
function label_faction_type(faction)
{
  if (faction.type != "faction")
  {
    faction.type_label = "(" + faction.type + ")";
  }
  else
  {
    faction.type_label = "";
  }
}