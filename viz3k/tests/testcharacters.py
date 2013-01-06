#! /usr/bin/env python
# -*- coding: utf-8 -*-

import json
from testify import *

import data.characters

class TestCharacters(TestCase):
    '''Tests for correctness of characters.json.'''
    @setup
    def setup(self):
        # load the characters.json data file
        self.factions, self.people = data.characters.from_json("../static/data/characters.json")

    def test_ids(self):
        '''Each person should have a unique id'''
        ids = []
        for person in self.people:
            assert_not_in(person.id, ids, "Id " + str(person.id) + " is not unique")
            ids.append(person.id)

    def test_contiguous_ids(self):
        '''When sorted, the list of ids should be {0,1,2,...,num_ids-1}.'''
        ids = []
        for person in self.people:
            ids.append(person.id)

        ids.sort()
        for i in range(len(ids)):
            assert_equal(ids[i],i)

if __name__ == "__main__":
    run()