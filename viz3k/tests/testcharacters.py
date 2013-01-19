#! /usr/bin/env python
# -*- coding: utf-8 -*-

import json
from testify import *

import data

class TestCharacters(TestCase):
    '''Tests for correctness of characters.json.'''
    @setup
    def setup(self):
        # load the characters.json data file
        self.people = data.People("../data/characters.json")

    def test_ids(self):
        '''Each person should have a unique id'''
        ids = []
        for person in self.people.people:
            assert_not_in(person.id, ids, "Id " + str(person.id) + " is not unique")
            ids.append(person.id)

    def test_contiguous_ids(self):
        '''When sorted, the list of ids should be {0,1,2,...,num_ids-1}.'''
        ids = []
        for person in self.people.people:
            ids.append(person.id)

        ids.sort()
        for i in range(len(ids)):
            assert_equal(ids[i],i)

if __name__ == "__main__":
    run()
