#! /usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
import operator

class Faction:
    def __init__(self, id, name, color, faction_type, members = [], chapters = []):
        self.id = id
        self.name = name
        self.color = color
        self.type = faction_type

        # relationships
        self.members = members # people in this faction
        self.chapters = chapters # chapters this faction appears in

    def __str__(self):
        desc = "faction(" + str(self.id) + "," + str(self.name) + "," + str(self.color) + "," + str(self.type) + ")"
        return desc

    def to_json(self):
        factions_json = {"id":self.id,"name":self.name,"color":self.color,"type":self.type}
        member_ids = []
        for member in self.members:
            member_ids.append(member.id)
        factions_json["members"] = member_ids
        return factions_json

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

    def has_person(self, person_id):
        if (person_id in self.ids):
            return True
        return False

class Chapter:
    def __init__(self, chapter, title, pages):
        self.chapter = chapter
        self.title = title
        self.pages = pages

    def __str__(self):
        desc_pages = ""
        for page in self.pages:
            desc_pages += str(page) + ","
        if (desc_pages[-1] == ","):
            desc_pages = desc_pages[:-1]

        desc = "chapter(" + str(self.chapter) + "," + self.title + "," + "[" + desc_pages + "])"
        return desc

    def num_appearances(self, person_id):
        total_appearances = 0
        for page in self.pages:
            if (page.has_person(person_id)):
                total_appearances += 1
        return total_appearances

    def people(self):
        people_ids = []
        for page in self.pages:
            for person_id in page.ids:
                if not(person_id in people_ids):
                    people_ids.append(person_id)
        return people_ids

    def to_json(self):
        return {"chapter":self.chapter,"title":self.title,"pages":[page.page for page in self.pages],"people":self.people()}

class Factions:
    def __init__(self, factions_json_path):
        """
        Parses the JSON file at factions_json_path and populates the factions list.
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
        self.factions = []
        for faction_json in factions_json["factions"]:
            self.factions.append(Faction(faction_json["id"],faction_json["name"],faction_json["color"],faction_json["type"]))

        self.factions.sort(key = operator.attrgetter("id"))

    def exists(self, faction_id):
        for faction in self.factions:
            if (faction.id == faction_id):
                return True
        return False

    def get(self, faction_id):
        for faction in self.factions:
            if (faction.id == faction_id):
                return faction
        # raise exception if faction not found
        raise ValueError("Could not find faction with id " + str(faction_id))

    def to_json(self):
        return {"factions":[faction.to_json() for faction in self.factions]}

    def set_members(self, people):
        for faction in self.factions:
            faction.members = [person for person in people if (person.faction == faction.id)]

class People:
    def __init__(self, characters_json_path):
        """
        Parses the JSON file at characters_json_path and populates the people list.
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
        self.people = []
        for person_json in characters_json["people"]:
            # create the Person object
            style = ""
            note = ""
            if (person_json.has_key("style")):
                style = person_json["style"]
            if (person_json.has_key("note")):
                note = person_json["note"]

            self.people.append(Person(person_json["id"],person_json["name"],style,person_json["faction"],note))
        self.people.sort(key = operator.attrgetter("id"))

    def exists(self, person_id):
        for person in self.people:
            if (person.id == person_id):
                return True
        return False

    def to_json(self):
        return {"people":[person.to_json() for person in self.people]}

class Chapters:
    def __init__(self, chapters_json_path):
        """
        Parses the JSON file at chapters_json_path and populates the chapters list.
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

        # parse the chapters
        self.chapters = []
        for chapter_json in chapters_json["chapters"]:
            pages = []
            pages_json = chapter_json["pages"]
            for page_json in pages_json:
                pages.append(Page(page_json["page"],page_json["ids"]))
            self.chapters.append(Chapter(chapter_json["chapter"],chapter_json["title"],pages))

    def exists(self, chapter_id):
        for chapter in self.chapters:
            if (chapter.chapter == chapter_id):
                return True
        return False

    def to_json(self):
        return {"chapters":[chapter.to_json() for chapter in self.chapters]}

    def num_appearances(self, person_id):
        total_appearances = 0
        for chapter in self.chapters:
            total_appearances += chapter.num_appearances(person_id)
        return total_appearances
