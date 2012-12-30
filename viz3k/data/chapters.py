#! /usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json

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
