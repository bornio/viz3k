#! /usr/bin/env ruby
# encoding: utf-8

require_relative "chapters"
require_relative "factions"
require_relative "people"
require_relative "deaths"
require_relative "coappearances"

module Viz3k
  def self.parse_json_file(path)
    begin
      json = File.read(path)
      hash = JSON.parse(json, symbolize_names: true)
    rescue => e
      # It's possible we couldn't find the file or it didn't parse as valid JSON, etc.
      raise StandardError.new("Could not read file " + path + " : " + e.to_s())
    end

    return hash
  end

  # The Api class is the interface between the web frontend and the backend. It returns data to the frontend in JSON
  # format.
  class Api
    attr_reader :factions
    attr_reader :people
    attr_reader :chapters
    attr_reader :deaths

    def initialize()
      # load the data from JSON files
      data_path = "./data"
      factions_hash = Viz3k::parse_json_file(data_path + "/factions.json")
      chapters_hash = Viz3k::parse_json_file(data_path + "/chapters.json")
      people_hash = Viz3k::parse_json_file(data_path + "/characters.json")
      allegiances_hash = Viz3k::parse_json_file(data_path + "/allegiances.json")
      deaths_hash = Viz3k::parse_json_file(data_path + "/deaths.json")

      # Build the data structures from the loaded data
      @factions = Factions.new(factions_hash)
      @chapters = Chapters.new(chapters_hash)
      @people = People.new(people_hash, allegiances_hash)
      @deaths = Deaths.new(deaths_hash)

      # define relationships
      @factions.set_members(@people.people)

      # set primary faction for each character over the whole novel and for each chapter
      @people.set_faction_info(@chapters)

      @coappearances = Coappearances.new(@people, @factions)
    end

    # Gets a JSON representation of the faction with the requested id.
    def faction_json(faction_id)
      return @factions.get(faction_id).to_hash().to_json()
    end

    # Gets a JSON representation of all chapters along with some additional info.
    def chapters_json()
      results = []
      @chapters.chapters.each do |chapter|
        chapter_hash = chapter.to_hash()

        # add death records
        chapter_hash.merge!(@deaths.in_chapter(chapter.chapter))
        results.push(chapter_hash)
      end

      return {"chapters" => results}.to_json()
    end

    # Gets a JSON representation of all people along with some additional info.
    def people_json()
      results = []
      @people.people.each_index do |person_id|
        results.push(person_hash(person_id))
      end

      return {"people" => results}.to_json()
    end

    # Gets a JSON representation of the person with the requested id.
    def person_json(person_id)
      return person_hash(person_id).to_json()
    end

    def person_hash(person_id)
      result = @people.get(person_id).to_hash()

      # get all appearances/mentions of this person in the novel
      result.merge!(:appearances => @chapters.appearances(person_id))

      # also include death info for this person, if any
      if (@deaths.exists?(person_id))
        result.merge!(:death => @deaths.get(person_id))
      end

      # also include kills for this person, if any
      killed_ids = @deaths.killed_by(person_id)
      killed_combat = killed_ids.select { |id| @deaths.get(id)[:cause] == "combat" }
      killed_murder = killed_ids.select { |id| @deaths.get(id)[:cause] == "murder" }
      killed_execution = killed_ids.select { |id| @deaths.get(id)[:cause] == "execution" }
      result.merge!(:killed_combat => killed_combat)
      result.merge!(:killed_murder => killed_murder)
      result.merge!(:killed_execution => killed_execution)

      return result
    end

    # Gets a JSON representation of the death record for the specified person id.
    def death_json(person_id)
      return @deaths.get(person_id).to_json()
    end

    # Returns a JSON list of deaths that took place within a given chapter.
    def deaths_in_chapter(chapter_num)
      return @deaths.in_chapter(chapter_num).to_json()
    end

    # Gets a JSON representation of the list of people killed by the person with the specified id.
    def killed_by(person_id)
      ids = @deaths.killed_by(person_id)
      people_killed = []
      ids.each do |id|
        if @people.exists(id)
          people_killed.push(person_hash(id))
        end
      end
      return {"killed_by" => people_killed}.to_json()
    end

    def coappearances_in_chapter(chapter_num)
      return coappearances_in_chapters([chapter_num])
    end

    # Generates a coappearance network using data from the specified chapters.
    def coappearances_in_chapters(chapter_nums)
      # raise an error if any chapter numbers in chapter_nums are invalid
      chapter_nums.each do |chapter_num|
        if (!@chapters.exists(chapter_num))
          raise StandardError.new("No chapter found with specified number")
        end
      end

      # create the list of pages
      pages = []
      @chapters.chapters.each do |chapter|
        if (chapter_nums.include?(chapter.chapter))
          pages += chapter.pages
        end
      end

      return @coappearances.coappearances(pages)
    end
  end
end
