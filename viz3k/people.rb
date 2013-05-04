#! /usr/bin/env ruby
# encoding: utf-8

require "json"
require "pp"

module Viz3k
  # Gets the corresponding full URL for links to external sites.
  class Externs
    # Gets the full URL for a Wikipedia article name string.
    def self.wiki_url(article_name)
      return "http://en.wikipedia.org/wiki/" + article_name
    end

    # Gets the full URL for a Kongming's Archives encyclopedia article name string.
    def self.km_url(article_name)
      return "http://kongming.net/encyclopedia/" + article_name
    end
  end

  # The People class provides methods to access a collection of Person objects.
  class People
    attr_reader :people
    attr_reader :allegiances

    def initialize(people_hash, allegiances_hash)
      # Hash structure mapping person ids to their allegiance info
      @allegiances = {}
      allegiances_hash[:allegiances].each do |allegiance_hash|
        allegiance_factions = []
        allegiance_hash[:allegiance].each do |faction_hash|
          faction = faction_hash[:faction]
          chron = 0
          interval = [5,1457]
          if (faction_hash.has_key?(:chron))
            chron = faction_hash[:chron]
          end
          if (faction_hash.has_key?(:interval))
            interval = faction_hash[:interval]
          end
          allegiance_faction = AllegianceFaction.new(chron, faction, interval)
          allegiance_factions.push(allegiance_faction)
        end
        @allegiances.merge!(allegiance_hash[:id]=>allegiance_factions)
      end

      @people = []
      people_hash[:people].each do |person_hash|
        allegiance = allegiances[person_hash[:id]]
        style = ""
        note = ""
        if (person_hash.has_key?(:style))
          style = person_hash[:style]
        end
        if (person_hash.has_key?(:note))
          note = person_hash[:note]
        end
        wiki = ""
        if (person_hash.has_key?(:wiki))
          wiki = Externs.wiki_url(person_hash[:wiki])
        end
        km = ""
        if (person_hash.has_key?(:km))
          km = Externs.km_url(person_hash[:km])
        end
        person = Person.new(person_hash[:id], person_hash[:name], allegiance,
                            style: style, note: note, wiki: wiki, km: km)
        @people.push(person)
      end
    end

    # Returns true if the Person with the given id was found, false otherwise.
    def exists(person_id)
      @people.each do |person|
        if (person.id == person_id)
          return true
        end
      end
      return false
    end

    # Returns a hash representation of the collection of Faction objects.
    def to_hash()
      people_hash = @people.map{|person| person.to_hash()}
      return {:people => people_hash}
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
        person.set_primary_faction(chapters)
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

    def to_hash()
      return {:chron => @chron, :faction => @faction, :interval => interval}
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
    attr_accessor :km
    attr_accessor :faction # a person's primary faction
    attr_accessor :faction_for_chapter # hash giving a person's primary faction within each chapter

    def initialize(id, name, allegiance, options = {})
      @id = id
      @name = name
      @allegiance = allegiance
      @style = ""
      @note = ""
      @wiki = ""
      @km = ""
      @faction = allegiance[0] # default value
      @faction_for_chapter = {}

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

      if (options[:km])
        @km = options[:km]
      end
    end

    # Returns a string representation of the Person object.
    def to_s()
      desc = "person(" + @id.to_s() + "," + @name
      if (@style != "")
        desc += "," + @style
      end
      desc += "," + @allegiance.to_s()
      desc += "," + @faction.to_s()
      desc += "," + @faction_for_chapter.to_s()
      if (@note != "")
        desc += "," + @note
      end
      desc += ")"
      return desc
    end

    # Returns a hash representation of the Person object.
    def to_hash()
      person_hash = {:id => @id, :name => @name, :faction => @faction, :faction_for_chapter => @faction_for_chapter,
                     :allegiance => @allegiance.map{|allegiance_faction| allegiance_faction.to_hash()}}
      if (@style != "")
        person_hash.merge!(:style => @style)
      end
      if (@note != "")
        person_hash.merge!(:note => @note)
      end
      if (@wiki != "")
        person_hash.merge!(:wiki => @wiki)
      end
      if (@km != "")
        person_hash.merge!(:km => @km)
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

    # Sets @faction based on this person's overall primary faction across the whole novel.
    def set_primary_faction(chapters)
      pages = []
      chapters.appearances(@id).each do |chapter_appearances|
        pages += chapter_appearances[:pages]
      end

      @faction = primary_faction(pages)

      # also set a primary faction per chapter
      chapters.chapters.each do |chapter|
        if (chapter.num_appearances(@id) > 0)
          @faction_for_chapter.merge!(chapter.chapter=>primary_faction(chapter.appearances(@id)))
        end
      end
    end

    # Gets the person's most strongly associated faction for a given range of pages.
    def primary_faction(page_nums)
      if (@allegiance.length() == 1)
        # the person is loyal to only one faction throughout the novel
        return @allegiance[0].faction
      else
        faction_page_counts = {}

        # initialize to 0 for all factions
        @allegiance.each do |person_faction|
          faction_page_counts.merge!(person_faction.faction=>0)
        end

        # count pages in which the person appears as a member of each faction
        @allegiance.each do |person_faction|
          # ignore the "Other" faction
          page_nums.each do |page_num|
            if (page_num >= person_faction.interval[0] && page_num <= person_faction.interval[1])
              faction_page_counts[person_faction.faction] += 1
            end
          end
        end

        # sort by highest number of pages, then by lowest faction id
        page_counts = faction_page_counts.sort_by{ |faction_id, page_count| [-page_count, faction_id] }
        return page_counts[0][0]
      end
    end
  end
end
