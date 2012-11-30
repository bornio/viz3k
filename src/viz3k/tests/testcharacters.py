#! /usr/bin/env python
# -*- coding: utf-8 -*-

import json
from testify import *

import data.characters

class TestCharacters(TestCase):
    @setup
    def setup(self):
        # load the characters.json data file
        self.factions, self.people = data.characters.from_json("../../website/data/characters.json")

    def test_ids(self):
        ''' Ensure each person has a unique id '''
        ids = []
        for person in self.people:
            assert_not_in(person.id, ids, "Id " + str(person.id) + " is not unique")
            ids.append(person.id)

if __name__ == "__main__":
    run()
