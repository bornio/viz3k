#! /usr/bin/env python
# -*- coding: utf-8 -*-

import json
from testify import *

import data.chapters

class TestChapters(TestCase):
    '''Tests for correctness of chapters.json.'''
    @setup
    def setup(self):
        # load the chapters.json data file
        self.chapters = data.chapters.from_json("../static/data/chapters.json")

    def test_unique_chapter_numbers(self):
        '''Each chapter should have a unique chapter number'''
        chapter_nums = []
        for chapter in self.chapters:
            assert_not_in(chapter.chapter, chapter_nums, "Chapter number " + str(chapter.chapter) + " is not unique")
            chapter_nums.append(chapter.chapter)

    def test_contiguous_chapter_numbers(self):
        '''When sorted, the list of chapter numbers should be {1,2,...,num_chapters}.'''
        chapter_nums = []
        for chapter in self.chapters:
            chapter_nums.append(chapter.chapter)

        chapter_nums.sort()
        for i in range(1,len(chapter_nums)+1):
            assert_equal(chapter_nums[i - 1],i)

    def test_unique_page_numbers(self):
        '''Each page should have a unique page number'''
        page_nums = []
        for chapter in self.chapters:
            for page in chapter.pages:
                assert_not_in(page.page, page_nums, "Page number " + str(page.page) + " is not unique")
                page_nums.append(page.page)

if __name__ == "__main__":
    run()
