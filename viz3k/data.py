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

    @staticmethod
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

    @staticmethod
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

    @staticmethod
    def from_json(chapters_json_path):
        """
        Parses the JSON file at chapters_json_path and returns a list of Chapter objects.
        """
        # read JSON file containing chapter info
        with open(chapters_json_path, "r") as chapters_file:
            chapters_json = json.load(chapters_file)

        # parse the JSON
        chapters = []
        for chapter_json in chapters_json["chapters"]:
            pages = []
            pages_json = chapter_json["pages"]
            for page_json in pages_json:
                pages.append(Page(page_json["page"],page_json["ids"]))
            chapters.append(Chapter(chapter_json["chapter"],pages))
        return chapters

def faction_for_person(factions, person):
    for faction in factions:
        if (faction.id == person.faction):
            return faction
    # raise exception if faction not found
    raise ValueError("Could not find faction for person " + str(person))

def factions_info(factions, people):
    info = []
    for faction in factions:
        faction_people = []
        for person in people:
            if (person.faction == faction.id):
                faction_people.append(person.id)
        info.append({"id":faction.id,"name":faction.name,"color":faction.color,"size":len(faction_people),"people":faction_people})
    return {"factions":info}
