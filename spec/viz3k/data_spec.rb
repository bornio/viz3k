#! /usr/bin/env ruby
# encoding: utf-8

require "spec_helper"
require "chapters"
require "factions"
require "people"
require "deaths"
require "api"
require "open-uri"

module Viz3k
  describe "data" do
    before(:all) do
      @data_path = "./data"
    end

    describe "factions.json" do
      before(:all) do
        factions_hash = Viz3k::parse_json_file(@data_path + "/factions.json")
        @factions = Factions.new(factions_hash)
      end

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
        it "should not have any duplicate links to wikipedia" do
            urls = []
            @factions.factions.each do |faction|
            if (faction.wiki != "")
              urls.should_not include(faction.wiki)
              urls.push(faction.wiki)
            end
          end
        end

        it "should not have any broken links to wikipedia", :network => true, :speed => "slow" do
          @factions.factions.each do |faction|
            if (faction.wiki != "")
              puts "      " + faction.wiki
              uri = open(URI.encode(faction.wiki))
              uri.status[1].should == "OK"
            end
          end
        end
      end
    end

    describe "characters.json and allegiances.json" do
      before(:all) do
        people_hash = Viz3k::parse_json_file(@data_path + "/characters.json")
        allegiances_hash = Viz3k::parse_json_file(@data_path + "/allegiances.json")
        @people = People.new(people_hash, allegiances_hash)
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

        describe "external links" do
          it "should not have any duplicate links to wikipedia" do
            urls = []
            @people.people.each do |person|
              if (person.wiki != "")
                urls.should_not include(person.wiki)
                urls.push(person.wiki)
              end
            end
          end

          it "should not have any duplicate links to kongming.net" do
            urls = []
            @people.people.each do |person|
              if (person.km != "")
                urls.should_not include(person.km)
                urls.push(person.km)
              end
            end
          end

          it "should not have any broken links to wikipedia", :network => true, :speed => "slow" do
            @people.people.each do |person|
              if (person.wiki != "")
                puts "        " + person.wiki
                uri = open(URI.encode(person.wiki))
                uri.status[1].should == "OK"
              end
            end
          end

          it "should not have any broken links to kongming.net", :network => true, :speed => "slow" do
            @people.people.each do |person|
              if (person.km != "")
                puts "        " + person.km
                uri = open(URI.encode(person.km))
                uri.status[1].should == "OK"
              end
            end
          end
        end
      end

      describe "allegiances.json" do
        it "should contain an allegiance entry for each person in characters.json" do
          @people.people.each do |person|
            @people.allegiances.has_key?(person.id).should == true
          end
        end

        it "should have at least one faction allegiance listed per person id" do
          @people.people.each do |person|
            person_allegiances = @people.allegiances[person.id]
            person_allegiances.length().should > 0
          end
        end

        it "should, when a person has > 1 factions listed, strictly order them by chron" do
          @people.people.each do |person|
            person_allegiances = @people.allegiances[person.id]
            if (person_allegiances.length() > 1)
              person_allegiances.each_with_index do |person_allegiance, i|
                person_allegiance.chron.should == i
              end
            end
          end
        end

        it "should cover the entire page range of the novel for every person" do
          @people.people.each do |person|
            person_allegiances = @people.allegiances[person.id]

            # first interval should start at page 5
            person_allegiances[0].interval[0].should == 5

            combined_start = 5
            combined_end = 5
            person_allegiances.each do |person_allegiance|
              interval_start = person_allegiance.interval[0]
              interval_end = person_allegiance.interval[1]
              
              # the interval bounds should be defined in increasing page order
              interval_end.should >= interval_start

              # each interval should start exactly at the end of the previous interval
              interval_start.should == combined_end

              # merge the interval into the range we have so far
              combined_end = interval_end
            end

            # last interval should end at page 1457
            combined_end.should == 1457
          end
        end
      end
    end

    describe "deaths.json" do
      before(:all) do
        people_hash = Viz3k::parse_json_file(@data_path + "/characters.json")
        allegiances_hash = Viz3k::parse_json_file(@data_path + "/allegiances.json")
        deaths_hash = Viz3k::parse_json_file(@data_path + "/deaths.json")
        @people = People.new(people_hash, allegiances_hash)
        @deaths = Deaths.new(deaths_hash)
      end

      it "each death record should correspond to a valid person id" do
        @deaths.deaths.each do |id, death|
          @people.exists(id).should == true
        end
      end

      it "causes of death should be one of [execution, illness, combat, murder, suicide]" do
        @deaths.deaths.each do |id, death|
          cause = death[:cause]
          valid_causes = ["execution", "illness", "combat", "murder", "suicide"]
          valid_causes.include?(cause).should == true
        end
      end

      it "each killer must be a valid person id" do
        @deaths.deaths.each do |id, death|
          if (death.has_key?(:killers))
            death[:killers].each do |killer|
              @people.exists(killer).should == true
            end
          end
        end
      end
    end

    describe "chapters.json" do
      before(:all) do
        chapters_hash = Viz3k::parse_json_file(@data_path + "/chapters.json")
        @chapters = Chapters.new(chapters_hash)
      end

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

    describe "people" do
      before(:all) do
        people_hash = Viz3k::parse_json_file(@data_path + "/characters.json")
        allegiances_hash = Viz3k::parse_json_file(@data_path + "/allegiances.json")
        chapters_hash = Viz3k::parse_json_file(@data_path + "/chapters.json")
        @people = People.new(people_hash, allegiances_hash)
        @chapters = Chapters.new(chapters_hash)
      end

      it "should each appear on at least one page in chapters.json" do
        @people.people.each do |person|
          @chapters.num_appearances(person.id).should > 0
        end
      end
    end
  end
end
