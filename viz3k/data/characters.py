#! /usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
import operator

class Person:
    def __init__(self, id, name, style, faction, note = ""):
        self.id = id
        self.name = name
        self.style = style
        self.faction = faction
        self.note = note

    def __str__(self):
        desc = "person(" + str(self.id) + "," + str(self.name)
        if (self.style != ""):
            desc += "," + str(self.style)
        desc += "," + str(self.faction)
        if (self.note != ""):
            desc += "," + str(self.note) + ")"
        
        return desc

def from_json(characters_json_path):
    """
    Parses the JSON file at characters_json_path and returns a tuple consisting of a list of a list
    of Person objects.
    """
    # read JSON file containing character info
    with open(characters_json_path, "r") as characters_file:
        characters_json = json.load(characters_file)
    
    # parse the people
    people = []
    for person_json in characters_json["people"]:
        # create the Person object
        style = ""
        note = ""
        if (person_json.has_key("style")):
            style = person_json["style"]
        if (person_json.has_key("note")):
            note = person_json["note"]

        people.append(Person(person_json["id"],person_json["name"],style,person_json["faction"],note))
    people.sort(key = operator.attrgetter("id"))
    
    return people
