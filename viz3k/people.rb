#! /usr/bin/env ruby
# encoding: utf-8

require "json"
require "pp"

module Viz3k
  # Gets the corresponding full URL for a Wikipedia article name string.
  class Externs
    def self.wiki_url(article_name)
      return "http://en.wikipedia.org/wiki/" + article_name
    end
  end

  # The People class provides methods to access a collection of Person objects.
  class People
    attr_reader :people
    attr_reader :allegiances

    def initialize(people_json_path, allegiances_json_path)
      begin
        people_file = File.read(people_json_path)
        people_hash = JSON.parse(people_file)

        allegiances_file = File.read(allegiances_json_path)
        allegiances_hash = JSON.parse(allegiances_file)
      rescue => e
        # It's possible we couldn't find the file or it didn't parse as valid JSON, etc.
        raise StandardError.new("Could not read characters data file : " + e.to_s())
      end

      # Hash structure mapping person ids to their allegiance info
      @allegiances = {}
      allegiances_hash["allegiances"].each do |allegiance_hash|
        allegiance_factions = []
        allegiance_hash["allegiance"].each do |faction_hash|
          faction = faction_hash["faction"]
          chron = 0
          interval = [5,1457]
          if (faction_hash.has_key?("chron"))
            chron = faction_hash["chron"]
          end
          if (faction_hash.has_key?("interval"))
            interval = faction_hash["interval"]
          end
          allegiance_faction = AllegianceFaction.new(chron, faction, interval)
          allegiance_factions.push(allegiance_faction)
        end
        @allegiances.merge!(allegiance_hash["id"]=>allegiance_factions)
      end

      @people = []
      people_hash["people"].each do |person_hash|
        allegiance = allegiances[person_hash["id"]]
        style = ""
        note = ""
        if (person_hash.has_key?("style"))
          style = person_hash["style"]
        end
        if (person_hash.has_key?("note"))
          note = person_hash["note"]
        end
        wiki = ""
        if (person_hash.has_key?("wiki"))
          wiki = Externs.wiki_url(person_hash["wiki"])
        end
        person = Person.new(person_hash["id"],person_hash["name"],allegiance,style:style,note:note,wiki:wiki)
        @people.push(person)
      end
    end

    # Returns true if the Person with the given id was found, false otherwise.
    def exists(person_id)
      @people.each do |person|
        if (person.id == person_id)
          return true
        end
        return false
      end
    end

    # Returns a hash representation of the collection of Faction objects.
    def to_hash()
      people_hash = @people.map{|person| person.to_hash()}
      return {"people"=>people_hash}
    end

    # Returns the Person with the requested id if found. Raises StandardError otherwise.
    def get(person_id)
      @people.each do |person|
        if (person.id == person_id)
          return person
        end
      end
      raise StandardError.new("No person found with specified id")
    end

    # Computes the primary faction for each person and saves it in the Person object.
    def set_primary_factions(chapters)
      @people.each do |person|
        person.faction = primary_faction(person.id, chapters)
      end
    end

    # Determines which faction a given person is most strongly associated with in terms of pages.
    def primary_faction(person_id, chapters)
      person = get(person_id)
      if (person.allegiance.length() == 1)
        return person.allegiance[0].faction
      else
        person_pages = chapters.appearances(person_id)
        faction_page_counts = {}

        # initialize to 0 for all factions
        person.allegiance.each do |person_faction|
          faction_page_counts.merge!(person_faction.faction=>0)
        end

        # count pages in which the person appears as a member of each faction
        person.allegiance.each do |person_faction|
          # ignore the "Other" faction
          person_pages.each do |person_page|
            if (person_page >= person_faction.interval[0] && person_page <= person_faction.interval[1])
              faction_page_counts[person_faction.faction] += 1
            end
          end
        end

        # sort by highest number of pages, then by lowest faction id
        page_counts = faction_page_counts.sort_by{ |faction_id, page_count| [-page_count, faction_id] }
        person.faction = page_counts[0][0]
      end
    end
  end

  class AllegianceFaction
    attr_reader :chron
    attr_reader :faction
    attr_reader :interval

    def initialize(chron, faction, interval)
      @chron = chron
      @faction = faction
      @interval = interval
    end

    def to_s()
      desc = "allegiance(" + @chron.to_s() + "," + @faction.to_s() + "," + @interval.to_s() + ")"
      return desc
    end
  end

  # A Person represents an individual character.
  class Person
    attr_accessor :id
    attr_accessor :name
    attr_accessor :allegiance
    attr_accessor :style
    attr_accessor :note
    attr_accessor :wiki
    attr_accessor :faction # a person's primary faction

    def initialize(id, name, allegiance, options = {})
      @id = id
      @name = name
      @allegiance = allegiance
      @faction = allegiance[0] # default value
      @style = ""
      @note = ""
      @wiki = ""

      # optional attributes
      if (options[:style])
        @style = options[:style]
      end

      if (options[:note])
        @note = options[:note]
      end

      if (options[:wiki])
        @wiki = options[:wiki]
      end
    end

    # Returns a string representation of the Person object.
    def to_s()
      desc = "person(" + @id.to_s() + "," + @name
      if (@style != "")
        desc += "," + @style
      end
      desc += "," + @allegiance.to_s()
      if (@note != "")
        desc += "," + @note
      end
      desc += ")"
      return desc
    end

    # Returns a hash representation of the Person object.
    def to_hash()
      person_hash = {"id"=>@id,"name"=>@name,"faction"=>@faction}
      if (@style != "")
        person_hash.merge!("style"=>@style)
      end
      if (@note != "")
        person_hash.merge!("note"=>@note)
      end
      if (@wiki != "")
        person_hash.merge!("wiki"=>@wiki)
      end
      return person_hash
    end

    def in_faction?(faction)
      @allegiance.each do |allegiance_faction|
        if (allegiance_faction.faction == faction)
          return true
        end
      end
      return false
    end
  end
end
