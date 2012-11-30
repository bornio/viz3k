#! /usr/bin/env python
# -*- coding: utf-8 -*-
#
# Processes JSON files containing character appearances from Romance of the Three Kingdoms.

"""coappear"""

import os
import sys
import json
from collections import defaultdict

import data.characters
import data.chapters

def read_json_data(data_path):
    # parse the data files for the lists of factions, characters, and chapters
    try:
        factions, people = data.characters.from_json(data_path + "/characters.json")
    except IOError as ioe:
        print "Failed to open characters file %s :" % ("'characters.json'")
        print "  %s" % (ioe)
        sys.exit()
    except ValueError as ve:
        print "Failed to parse characters file %s :" % ("'characters.json'")
        print "  %s" % (ve)
        sys.exit()
    
    try:
        chapters = data.chapters.from_json(data_path + "/chapters.json")
    except IOError as ioe:
        print "Failed to open chapters file %s :" % ("'chapters.json'")
        print "  %s" % (ioe)
        sys.exit()
    except ValueError as ve:
        print "Failed to parse chapters file %s :" % ("'chapters.json'")
        print "  %s" % (ve)
        sys.exit()

    return (factions, people, chapters)

def coappearances(chapters, people, min_links = 0):
    nodes = []
    links = []
    node_indices = {}
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

    # filter out nodes with fewer than min_links links
    if (min_links > 0):
        nodes = [node for node in nodes if (node["links"] >= min_links)]

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

                    # lower id is always the link source, higher id always the target
                    if (id0 > id1):
                        id0 = page.ids[j]
                        id1 = page.ids[i]

                    # only create links between nodes that haven't been filtered out
                    if (((id0 in node_indices) and (id1 in node_indices)) == False):
                        break

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
    if (len(args) != 1):
        # too few or too many args
        parser.print_help()
        exit()
    
    # get data from JSON
    data_path = args[0]
    factions, people, chapters = read_json_data(data_path)

    print "Found %d characters in %d chapters." % (len(people), len(chapters))

    # compute coappearances for the entire book combined
    coappear_json = coappearances(chapters, people, 50)

    # write to file
    try:
        output_file = open(data_path + "/3k-coappear.json", "w")
    except IOError, (errno, strerror):
        print "I/O error(%s): %s" % (errno, strerror)
        sys.exit()
    json.dump(coappear_json, output_file)
    output_file.close()

    # compute coappearances for each chapter separately
    for chapter in chapters:
        print "processing coappearances for chapter %d..." % (chapter.chapter)
        coappear_json = coappearances([chapter], people)

        # write to file
        output_path = data_path + "/3k-coappear-" + str(chapter.chapter) + ".json"
        try:
            output_file = open(output_path, "w")
        except IOError, (errno, strerror):
            print "I/O error(%s): %s" % (errno, strerror)
            sys.exit()
        json.dump(coappear_json, output_file)
        output_file.close()
