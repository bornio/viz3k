#! /usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
import operator

class Faction:
    def __init__(self, id, name, color, faction_type):
        self.id = id
        self.name = name
        self.color = color
        self.type = faction_type

    def __str__(self):
        desc = "faction(" + str(self.id) + "," + str(self.name) + "," + str(self.color) + "," + str(self.type) + ")"
        return desc

    @staticmethod
    def from_json(factions_json_path):
        """
        Parses the JSON file at factions_json_path and returns a tuple consisting of a list of Faction objects.
        """
        # read JSON file containing faction info
        try:
            with open(factions_json_path, "r") as factions_file:
                factions_json = json.load(factions_file)
        except IOError as ioe:
            # rethrow exception with additional info
            raise IOError("Failed to open factions file '" + factions_json_path + "' : " + ioe)
        except ValueError as ve:
            # rethrow exception with additional info
            raise ValueError("Failed to parse factions file '" + factions_json_path + "' : " + ve)

        # parse the factions
        factions = []
        for faction_json in factions_json["factions"]:
            factions.append(Faction(faction_json["id"],faction_json["name"],faction_json["color"],faction_json["type"]))

        factions.sort(key = operator.attrgetter("id"))
        
        return factions

    def to_json(self):
        return {"id":self.id,"name":self.name,"color":self.color,"type":self.type}

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
        try:
            with open(characters_json_path, "r") as characters_file:
                characters_json = json.load(characters_file)
        except IOError as ioe:
            # rethrow exception with additional info
            raise IOError("Failed to open characters file '" + characters_json_path + "' : " + ioe)
        except ValueError as ve:
            # rethrow exception with additional info
            raise ValueError("Failed to parse characters file '" + characters_json_path + "' : " + ve)
        
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

    def to_json(self):
        person_json = {"id":self.id,"name":self.name,"faction":self.faction}
        if (self.style != ""):
            person_json["style"] = self.style
        if (self.note != ""):
            person_json["note"] = self.note
        return person_json

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
        try:
            with open(chapters_json_path, "r") as chapters_file:
                chapters_json = json.load(chapters_file)
        except IOError as ioe:
            # rethrow exception with additional info
            raise IOError("Failed to open chapters file '" + chapters_json_path + "' : " + ioe)
        except ValueError as ve:
            # rethrow exception with additional info
            raise ValueError("Failed to parse chapters file '" + chapters_json_path + "' : " + ve)
        

        # parse the JSON
        chapters = []
        for chapter_json in chapters_json["chapters"]:
            pages = []
            pages_json = chapter_json["pages"]
            for page_json in pages_json:
                pages.append(Page(page_json["page"],page_json["ids"]))
            chapters.append(Chapter(chapter_json["chapter"],pages))
        return chapters
