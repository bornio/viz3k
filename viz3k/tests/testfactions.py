#! /usr/bin/env python
# -*- coding: utf-8 -*-

import json
from testify import *

import data

class TestFactions(TestCase):
    '''Tests for correctness of factions.json.'''
    @setup
    def setup(self):
        # load the factions.json data file
        self.factions = data.Factions("../data/factions.json")

    def test_ids(self):
        '''Each faction should have a unique id'''
        ids = []
        for faction in self.factions.factions:
            assert_not_in(faction.id, ids, "Id " + str(faction.id) + " is not unique")
            ids.append(faction.id)

    def test_names(self):
        '''Each faction should have a unique name'''
        names = []
        for faction in self.factions.factions:
            assert_not_in(faction.name, names, "Name " + faction.name + " is not unique")
            names.append(faction.name)

if __name__ == "__main__":
    run()
