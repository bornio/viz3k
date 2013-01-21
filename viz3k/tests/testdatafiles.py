#! /usr/bin/env python
# -*- coding: utf-8 -*-

import json
from testify import *

import data

class TestDataFiles(TestCase):
    '''Tests for correctness of characters.json.'''
    @setup
    def setup(self):
        # load the factions.json data file
        self.factions = data.Factions("../data/factions.json")
        # load the characters.json data file
        self.people = data.People("../data/characters.json")
        # load the chapters.json data file
        self.chapters = data.Chapters("../data/chapters.json")

    def test_factions_ids(self):
        '''Each faction should have a unique id.'''
        ids = []
        for faction in self.factions.factions:
            assert_not_in(faction.id, ids, "Id " + str(faction.id) + " is not unique")
            ids.append(faction.id)

    def test_factions_names(self):
        '''Each faction should have a unique name.'''
        names = []
        for faction in self.factions.factions:
            assert_not_in(faction.name, names, "Name " + faction.name + " is not unique")
            names.append(faction.name)

    def test_people_ids(self):
        '''Each person should have a unique id.'''
        ids = []
        for person in self.people.people:
            assert_not_in(person.id, ids, "Id " + str(person.id) + " is not unique")
            ids.append(person.id)

    def test_people_contiguous_ids(self):
        '''When sorted, the list of ids should be {0,1,2,...,num_ids-1}.'''
        ids = []
        for person in self.people.people:
            ids.append(person.id)

        ids.sort()
        for i in range(len(ids)):
            assert_equal(ids[i],i)

    def test_unique_chapter_numbers(self):
        '''Each chapter should have a unique chapter number.'''
        chapter_nums = []
        for chapter in self.chapters.chapters:
            assert_not_in(chapter.chapter, chapter_nums, "Chapter number " + str(chapter.chapter) + " is not unique")
            chapter_nums.append(chapter.chapter)

    def test_contiguous_chapter_numbers(self):
        '''When sorted, the list of chapter numbers should be {1,2,...,num_chapters}.'''
        chapter_nums = []
        for chapter in self.chapters.chapters:
            chapter_nums.append(chapter.chapter)

        chapter_nums.sort()
        for i in range(1,len(chapter_nums)+1):
            assert_equal(chapter_nums[i - 1],i)

    def test_unique_page_numbers(self):
        '''Each page should have a unique page number.'''
        page_nums = []
        for chapter in self.chapters.chapters:
            for page in chapter.pages:
                assert_not_in(page.page, page_nums, "Page number " + str(page.page) + " is not unique")
                page_nums.append(page.page)

    def test_unique_person_ids_per_page(self):
        '''Each person who appears on a page should appear at most once on that page.'''
        for chapter in self.chapters.chapters:
            for page in chapter.pages:
                person_ids = []
                for person_id in page.ids:
                    assert_not_in(person_id, person_ids, "Page " + str(page.page) + " : person " + str(person_id) +
                                  " appears more than once")
                    person_ids.append(person_id)

    def test_people_appear_at_least_once(self):
        '''Each person should appear at least once among all the pages.'''
        for person in self.people.people:
            assert_gt(self.chapters.num_appearances(person.id), 0)

if __name__ == "__main__":
    run()
