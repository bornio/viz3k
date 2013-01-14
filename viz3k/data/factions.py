#! /usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
import operator

class Faction:
    def __init__(self, id, name, color):
        self.id = id
        self.name = name
        self.color = color

    def __str__(self):
        desc = "faction(" + str(self.id) + "," + str(self.name) + str(self.color) + ")"
        return desc

def from_json(factions_json_path):
    """
    Parses the JSON file at factions_json_path and returns a tuple consisting of a list of Faction objects.
    """
    # read JSON file containing faction info
    with open(factions_json_path, "r") as factions_file:
        factions_json = json.load(factions_file)

    # parse the factions
    factions = []
    for faction_json in factions_json["factions"]:
        factions.append(Faction(faction_json["id"],faction_json["name"],faction_json["color"]))

    factions.sort(key = operator.attrgetter("id"))
    
    return factions
