#! /usr/bin/env python
# -*- coding: utf-8 -*-
#
# Processes JSON files containing character appearances from Romance of the Three Kingdoms.

"""Web app should always get data through here instead of directly using the data module."""

import os
import sys
import json

import data

# path to the data files from main.py
data_path = "./data"

# utility functions for getting data
def all_factions():
    return data.Faction.from_json(data_path + "/factions.json")

def all_people():
    return data.Person.from_json(data_path + "/characters.json")

def all_chapters():
    return data.Chapter.from_json(data_path + "/chapters.json")

def faction_exists(faction_id):
    for faction in all_factions():
        if (faction.id == faction_id):
            return True
    return False

def person_exists(person_id):
    for person in all_people():
        if (person.id == person_id):
            return True
    return False

def chapter_exists(chapter_id):
    for chapter in all_chapters():
        if (chapter.chapter == chapter_id):
            return True
    return False

def faction_for_person(person):
    # always query for fresh data in case it's been updated
    for faction in all_factions():
        if (faction.id == person.faction):
            return faction
    # raise exception if faction not found
    raise ValueError("Could not find faction for person " + str(person))

def factions_people_info():
    """
    For each faction found, return the ids of people who belong to that faction.
    """
    info = []
    for faction in all_factions():
        people_ids = []
        for person in all_people():
            if (person.faction == faction.id):
                people_ids.append(person.id)
        info.append({"id":faction.id,"name":faction.name,"color":faction.color,"size":len(people_ids),
                     "people":people_ids})
    return {"factions":info}

def faction_info(faction_id):
    for faction in all_factions():
        if (faction.id == faction_id):
            return faction.to_json()
    raise ValueError("Faction " + str(faction_id) + " does not exist, or has not been added yet.")

def faction_people(faction_id):
    """
    Find out which people belong to the faction with the given id.
    """
    people_for_faction = []
    for person in all_people():
        if (person.faction == faction_id):
            people_for_faction.append(person.to_json())
    return {"people":people_for_faction}

