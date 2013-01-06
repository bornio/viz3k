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

class Coappear:
    def __init__(self, data_path):
        # parse the data files for the lists of factions, characters, and chapters
        try:
            self.factions, self.people = data.characters.from_json(data_path + "/characters.json")
        except IOError as ioe:
            # rethrow exception with additional info
            raise IOError("Failed to open characters file '" + data_path + "/characters.json' : " + ioe)
        except ValueError as ve:
            # rethrow exception with additional info
            raise ValueError("Failed to parse characters file '" + data_path + "/characters.json' : " + ve)
        
        try:
            self.chapters = data.chapters.from_json(data_path + "/chapters.json")
        except IOError as ioe:
            # rethrow exception with additional info
            raise IOError("Failed to open chapters file '" + data_path + "/chapters.json' : " + ioe)
        except ValueError as ve:
            # rethrow exception with additional info
            raise ValueError("Failed to parse chapters file '" + data_path + "/chapters.json' : " + ve)

        print "Found %d characters in %d chapters." % (len(self.people), len(self.chapters))

    def has_chapter(self, chapter_num):
        for chapter in self.chapters:
            if (chapter.chapter == chapter_num):
                return True
        return False

    def coappearances(self, chapter_nums, min_links = 0):
        nodes = []
        links = []
        node_indices = {}
        num_links = defaultdict(int)

        # raise ValueError if any chapter numbers in chapter_nums are invalid
        for chapter_num in chapter_nums:
            if (not self.has_chapter(chapter_num)):
                raise ValueError("Chapter " + str(chapter_num) + " does not exist, or has not been added yet.")

        # create nodes for every person who shares a page with any other person
        for chapter in self.chapters:
            if chapter.chapter in chapter_nums:
                for page in chapter.pages:
                    if (len(page.ids) > 1):
                        for person_id in page.ids:
                            # get the corresponding person object
                            for person in self.people:
                                if (person.id == person_id):
                                    # number of links for this person on this page
                                    num_links = len(page.ids) - 1
                                    # append new node if there isn't one for this person
                                    # otherwise add to number of links on existing node
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
        for chapter in self.chapters:
            if chapter.chapter in chapter_nums:
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
