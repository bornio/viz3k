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

class Person:
    def __init__(self, id, name, faction, note = ""):
        self.id = id
        self.name = name
        self.faction = faction
        self.note = note

    def __str__(self):
        desc = "person(" + str(self.id) + "," + str(self.name) + "," + str(self.faction)
        if (self.note != ""):
            desc += "," + str(self.note) + ")"
        
        return desc

class Page:
    def __init__(self, page, ids):
        self.page = page
        self.ids = ids

    def __str__(self):
        desc = "page(" + str(self.page) + "," + str(self.ids) + ")"
        return desc

class Chapter:
    def __init__(self, chapter, pages):
        self.chapter = chapter
        self.pages = pages

    def __str__(self):
        desc_pages = ""
        for page in self.pages:
            desc_pages += str(page) + ","
        if (desc_pages[-1] == ","):
            desc_pages = desc_pages[:-1]

        desc = "chapter(" + str(self.chapter) + "," + "[" + desc_pages + "])"
        return desc

def read_factions(factions_json):
    factions = []
    for faction_json in factions_json:
        factions.append(Faction(faction_json["id"],faction_json["name"],faction_json["color"]))
    return factions

def read_chapters(chapters_json):
    chapters = []
    for chapter_json in chapters_json:
        pages = []
        pages_json = chapter_json["pages"]
        for page_json in pages_json:
            pages.append(Page(page_json["page"],page_json["ids"]))
        chapters.append(Chapter(chapter_json["chapter"],pages))
    return chapters

def read_people(people_json, factions):
    people = []
    for person_json in people_json:
        # find the relevant faction for this person
        faction_id = person_json["faction"]
        for faction in factions:
            if (faction.id == faction_id):
                person_faction = faction

        # create the Person object
        if (person_json.has_key("note")):
            people.append(Person(person_json["id"],person_json["name"],person_faction,person_json["note"]))
        else:
            people.append(Person(person_json["id"],person_json["name"],person_faction))
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
    chapters = read_chapters(input_json["chapters"])

    return (factions, people, chapters)

def compute_coappearances(chapters, people):
    nodes = []
    links = []
    node_indices = defaultdict(int)
    num_links = defaultdict(int)

    # create nodes for every person who shares a page with any other person
    for chapter in chapters:
        for page in chapter.pages:
            if (len(page.ids) > 1):
                for person_id in page.ids:
                    # get the corresponding person object
                    for person in people:
                        if (person.id == person_id):
                            # number of links for this person on this page
                            num_links = len(page.ids) - 1
                            # append new node if one doesn't exist for this person, otherwise increment node links
                            found = False
                            for node in nodes:
                                if (node["id"] == person_id):
                                    node["links"] += num_links
                                    found = True
                                    break
                            if (found == False):
                                nodes.append({"id":person.id,"name":person.name,"group":person.faction.id,
                                                  "color":person.faction.color,"links":num_links})
                            break

    # sort nodes in order of id BEFORE creating links, as links must be based on node ordering
    nodes.sort(key=lambda item: (item["id"]))

    for n in range(len(nodes)):
        node = nodes[n]
        node_indices[node["id"]] = n

    # now create links for every pair of nodes representing people who appear on the same page
    for chapter in chapters:
        for page in chapter.pages:
            for i in range(len(page.ids)):
                for j in range(i + 1, len(page.ids)):
                    id0 = page.ids[i]
                    id1 = page.ids[j]

                    #print "page %d: found link between %d and %d" % (page.page, id0, id1)

                    # if a link already exists between two people, increment the value of the link
                    exists = False
                    for link in links:
                        if (link["source"] == node_indices[id0] and link["target"] == node_indices[id1]):
                            link["value"] = link["value"] + 1
                            exists = True
                            break
                    # otherwise, add a new link
                    if (exists == False):
                        links.append({"source":node_indices[id0],"target":node_indices[id1],"value":1})

    links.sort(key=lambda item: (item['source'], item['target']))

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
    factions, people, chapters = read_json_data()

    print "Found %d characters in %d chapters." % (len(people), len(chapters))

    # compute coappearances for the entire book combined
    coappear_json = compute_coappearances(chapters, people)

    # write to file
    try:
        output_file = open("data/3k-coappear.json", "w")
    except IOError, (errno, strerror):
        print "I/O error(%s): %s" % (errno, strerror)
        sys.exit()
    json.dump(coappear_json, output_file)
    output_file.close()

    # compute coappearances for each chapter separately
    for chapter in chapters:
        print "processing coappearances for chapter %d..." % (chapter.chapter)
        coappear_json = compute_coappearances([chapter], people)

        # write to file
        output_path = "data/3k-coappear-" + str(chapter.chapter) + ".json"
        try:
            output_file = open(output_path, "w")
        except IOError, (errno, strerror):
            print "I/O error(%s): %s" % (errno, strerror)
            sys.exit()
        json.dump(coappear_json, output_file)
        output_file.close()
