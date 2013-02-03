#! /usr/bin/env ruby
# encoding: utf-8

require 'spec_helper'
require 'data'
require 'open-uri'

describe "data" do
  before(:all) do
    data_path = "./data"
    @factions = Viz3k::Factions.new(data_path + "/factions.json")
    @people = Viz3k::People.new(data_path + "/characters.json")
    @chapters = Viz3k::Chapters.new(data_path + "/chapters.json")
  end

  describe "factions.json" do
    it "should not contain any factions with the same id" do
      ids = []
      @factions.factions.each do |faction|
        ids.should_not include(faction.id)
        ids.push(faction.id)
      end
    end

    it "should not contain any factions with the same name as one another" do
      names = []
      @factions.factions.each do |faction|
        names.should_not include(faction.name)
        names.push(faction.name)
      end
    end

    describe "external links" do
      it "should not have any broken links to wikipedia", :network => true, :speed => "slow" do
        @factions.factions.each do |faction|
          if (faction.wiki != "")
            uri = open(URI.encode(faction.wiki))
            uri.status[1].should == "OK"
          end
        end
      end
    end
  end

  describe "characters.json" do
    it "should not contain any people with the same id" do
      ids = []
      @people.people.each do |person|
        ids.should_not include(person.id)
        ids.push(person.id)
      end
    end

    it "should not contain more than one person with the same name" do
      names = []
      @people.people.each do |person|
        names.should_not include(person.name)
        names.push(person.name)
      end
    end

    it "should have only contiguous ids starting from 0, i.e. {0,1,2,...,num_ids-1}" do
      ids = @people.people.map{|person| person.id}
      ids.sort!()
      ids.each do |id|
        ids.index(id).should == id
      end
    end

    it "should contain only people who appear on at least one page in chapters.json" do
      @people.people.each do |person|
        @chapters.num_appearances(person.id).should >= 0
      end
    end

    describe "external links" do
      it "should not have any broken links to wikipedia", :network => true, :speed => "slow" do
        @people.people.each do |person|
          if (person.wiki != "")
            uri = open(URI.encode(person.wiki))
            uri.status[1].should == "OK"
          end
        end
      end
    end
  end

  describe "chapters.json" do
    it "should not contain any chapters with the same chapter number" do
      chapter_nums = []
      @chapters.chapters.each do |chapter|
        chapter_nums.should_not include(chapter.chapter)
        chapter_nums.push(chapter.chapter)
      end
    end

    it "should have only contiguous chapter numbers starting from 1, i.e. {1,2,3,...,num_chapters}" do
      chapter_nums = @chapters.chapters.map{|chapter| chapter.chapter}
      chapter_nums.sort!()
      chapter_nums.each do |chapter_num|
        chapter_nums.index(chapter_num).should == chapter_num - 1
      end
    end

    it "should not contain any pages with the same page number" do
      page_nums = []
      @chapters.chapters.each do |chapter|
        chapter.pages.each do |page|
          page_nums.should_not include(page.page)
          page_nums.push(page.page)
        end
      end
    end
  end
end
