#!/usr/bin/python
#
# Processes a JSON file containing character appearances from Romance of the Three Kingdoms.

"""3k"""

import os
import sys
import json
import operator
from collections import defaultdict

class Faction:
    def __init__(self, id, name, color):
        self.id = id
        self.name = name
        self.color = color

    def __str__(self):
        desc = "faction(" + str(self.id) + "," + str(self.name) + str(self.color) + ")"
        return desc

class Appearance:
    def __init__(self, chapter, page):
        self.chapter = chapter
        self.page = page

    def __str__(self):
        desc = "appearance(" + str(self.chapter) + "," + str(self.page) + ")"
        return desc

class Person:
    def __init__(self, id, name, faction, appearances, note = ""):
        self.id = id
        self.name = name
        self.faction = faction
        self.appearances = appearances
        self.note = note

    def __str__(self):
        desc_appearances = "appearances("
        for appearance in self.appearances:
            desc_appearances += str(appearance) + ","
        if (desc_appearances[-1] == ","):
            desc_appearances = desc_appearances[:-1]
        desc_appearances += ")"

        desc = "person(" + str(self.id) + "," + str(self.name) + "," + str(self.faction) + "," + desc_appearances
        if (self.note != ""):
            desc += "," + str(self.note) + ")"
        
        return desc

def read_factions(factions_json):
    factions = []
    for faction_json in factions_json:
        factions.append(Faction(faction_json["id"],faction_json["name"],faction_json["color"]))
    return factions

def read_appearances(appearances_json):
    appearances = []
    for appearance_json in appearances_json:
        appearances.append(Appearance(appearance_json["chapter"],appearance_json["page"]))
    appearances.sort(key = operator.attrgetter("page"))
    return appearances

def read_people(people_json, factions):
    people = []
    for person_json in people_json:
        # find the relevant faction for this person
        faction_id = person_json["faction"]
        for faction in factions:
            if (faction.id == faction_id):
                person_faction = faction

        # get the list of this person's appearances in the novel
        appearances = read_appearances(person_json["appearances"])

        # create the Person object
        if (person_json.has_key("note")):
            people.append(Person(person_json["id"],person_json["name"],person_faction,appearances,person_json["note"]))
        else:
            people.append(Person(person_json["id"],person_json["name"],person_faction,appearances))
    people.sort(key = operator.attrgetter("id"))
    return people

def read_json_data():
    # read 3k.json file (hard-coded path!)
    try:
        input_file = open("data/3k.json", "r")
    except IOError, (errno, strerror):
        print "I/O error(%s): %s" % (errno, strerror)
        sys.exit()

    input_json = json.load(input_file)
    input_file.close()

    # parse the JSON for the list of factions and list of characters
    factions = read_factions(input_json["factions"])
    people = read_people(input_json["people"], factions)

    return (factions, people)

def appearances_by_page(people, chapters):
    appearances = defaultdict(list)
    for person in people:
        for appearance in person.appearances:
            # count an appearance only if it is from one of the selected chapters
            if (appearance.chapter in chapters):
                appearances[appearance.page].append(person.id)
    return appearances

def people_chapters(people):
    chapters = defaultdict(bool)
    for person in people:
        for appearance in person.appearances:
            chapters[appearance.chapter] = True
    # return array of all the chapters in which any character appearances occurred
    return chapters.keys()

def compute_coappearances(appearances, people):
    # create nodes from people and links from coappearances of pairs of people
    nodes = []
    links = []
    num_links = defaultdict(int)
    for person in people:
        for page in appearances:
            if (person.id in appearances[page]):
                # create links to all other persons who appear on the same page
                for other_id in appearances[page]:
                    if (person.id != other_id):
                        # if a link already exists between two people, increment the value of the link
                        exists = False
                        for link in links:
                            if (link["source"] == person.id and link["target"] == other_id):
                                link["value"] = link["value"] + 1
                                exists = True
                                break
                        # otherwise, add a new link
                        if (exists == False):
                            links.append({"source":person.id,"target":other_id,"value":1})

                        # increment the count of links for this person AS WELL AS the other person
                        num_links[person.id] += 1
                        num_links[other_id] += 1
                # remove this id from the page so we don't get duplicate edges
                appearances[page].remove(person.id)
        # save this person as a node, if the person has any links
        if (num_links[person.id] > 0):
            nodes.append({"id":person.id,"name":person.name,"group":person.faction.id,"color":person.faction.color,
                          "links":num_links[person.id]})

    # re-index link source and target using node indices rather than person ids, since they will not be identical
    for link in links:
        for node in nodes:
            if (node["id"] == link["source"]):
                link["source"] = nodes.index(node)
                break
        for node in nodes:
            if (node["id"] == link["target"]):
                link["target"] = nodes.index(node)
                break

    # the complete JSON representation with nodes + links together
    return {"nodes":nodes,"links":links}

if __name__ == "__main__":
    from optparse import OptionParser
    
    # parse arguments
    usage = "usage: %prog [options]"
    parser = OptionParser(usage = usage)
    (opts, args) = parser.parse_args()
    
    # check arguments
    if (len(args) != 0):
        # too few or too many args
        parser.print_help()
        exit()
    
    # get data from JSON
    factions, people = read_json_data()
    all_chapters = people_chapters(people)
    all_appearances = appearances_by_page(people, all_chapters)

    print "Found %d characters in %d chapters." % (len(people), len(all_chapters))

    # compute coappearances for the entire book combined
    coappear_json = compute_coappearances(all_appearances, people)

    # write to file
    try:
        output_file = open("data/3k-coappear.json", "w")
    except IOError, (errno, strerror):
        print "I/O error(%s): %s" % (errno, strerror)
        sys.exit()
    json.dump(coappear_json, output_file)
    output_file.close()

    # compute coappearances for each chapter separately
    for chapter in all_chapters:
        chapter_appearances = appearances_by_page(people, [chapter])
        coappear_json = compute_coappearances(chapter_appearances, people)

        # write to file
        output_path = "data/3k-coappear-" + str(chapter) + ".json"
        try:
            output_file = open(output_path, "w")
        except IOError, (errno, strerror):
            print "I/O error(%s): %s" % (errno, strerror)
            sys.exit()
        json.dump(coappear_json, output_file)
        output_file.close()
