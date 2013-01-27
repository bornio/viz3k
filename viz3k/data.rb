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

  # The Factions class provides methods to access a collection of Faction objects.
  class Factions
    attr_reader :factions

    def initialize(factions_json_path)
      begin
        factions_file = File.read(factions_json_path)
        factions_json = JSON.parse(factions_file)
      rescue Exception => e
        # It's possible we couldn't find the file or it didn't parse as valid JSON, etc.
        raise StandardError.new("Could not read factions data file", e)
      end

      @factions = []
      factions_json["factions"].each do |faction_json|
        wiki = ""
        if (faction_json.has_key?("wiki"))
          wiki = Externs.wiki_url(faction_json["wiki"])
        end
        faction = Faction.new(faction_json["id"],faction_json["name"],faction_json["color"],faction_json["type"],wiki:wiki)
        @factions.push(faction)
      end
    end

    # Returns true if the Faction with the given id was found, false otherwise.
    def exists(faction_id)
      @factions.each do |faction|
        if (faction.id == faction_id)
          return true
        end
      end
      return false
    end

    # Returns the Faction with the requested id if found. Raises StandardError otherwise.
    def get(faction_id)
      @factions.each do |faction|
        if (faction.id == faction_id)
          return faction
        end
      end
      raise StandardError.new("No faction found with specified id")
    end

    # Returns a hash representation of the collection of Faction objects.
    def to_hash()
      factions_hash = @factions.map{|faction| faction.to_hash()}
      return {"factions"=>factions_hash}
    end

    # Sets the members of all Faction objects in this collection from the ids of an array of Person objects.
    def set_members(people)
      @factions.each do |faction|
        faction.members = people.select{|person| person.faction == faction.id}
      end
    end
  end

  # The People class provides methods to access a collection of Person objects.
  class People
    attr_reader :people

    def initialize(people_json_path)
      begin
        people_file = File.read(people_json_path)
        people_json = JSON.parse(people_file)
      rescue Exception => e
        # It's possible we couldn't find the file or it didn't parse as valid JSON, etc.
        raise StandardError.new("Could not read characters data file", e)
      end

      @people = []
      people_json["people"].each do |person_json|
        style = ""
        note = ""
        if (person_json.has_key?("style"))
          style = person_json["style"]
        end
        if (person_json.has_key?("note"))
          note = person_json["note"]
        end
        person = Person.new(person_json["id"],person_json["name"],person_json["faction"],style:style,note:note)
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
  end

  # The Chapters class provides methods to access a collection of Chapter objects.
  class Chapters
    attr_reader :chapters

    def initialize(chapters_json_path)
      begin
        chapters_file = File.read(chapters_json_path)
        chapters_json = JSON.parse(chapters_file)
      rescue Exception => e
        # It's possible we couldn't find the file or it didn't parse as valid JSON, etc.
        raise StandardError.new("Could not read chapters data file", e)
      end

      @chapters = []
      chapters_json["chapters"].each do |chapter_json|
        pages = []
        pages_json = chapter_json["pages"]
        pages_json.each do |page_json|
          pages.push(Page.new(page_json["page"],page_json["ids"]))
        end
        chapter = Chapter.new(chapter_json["chapter"],chapter_json["title"],pages)
        @chapters.push(chapter)
      end
    end

    # Returns a hash representation of the collection of Chapter objects.
    def to_hash()
      chapters_hash = @chapters.map{|chapter| chapter.to_hash()}
      return {"chapters"=>chapters_hash}
    end

    # Returns true if the Chapter with the given chapter number was found, false otherwise.
    def exists(chapter_num)
      @chapters.each do |chapter|
        if (chapter.chapter == chapter_num)
          return true
        end
      end
      return false
    end

    # Returns the total number of times the person with the given id appears among all the chapters contained.
    def num_appearances(person_id)
      total_appearances = 0
      @chapters.each do |chapter|
        total_appearances += chapter.num_appearances(person_id)
      end
      return total_appearances
    end
  end

  # A Faction represents a group of individuals in the Three Kingdoms.
  class Faction
    attr_accessor :id
    attr_accessor :name
    attr_accessor :color
    attr_accessor :type
    attr_accessor :wiki
    attr_accessor :members
    attr_accessor :chapters

    def initialize(id, name, color, type, options = {})
      @id = id
      @name = name
      @color = color
      @type = type
      @wiki = ""
      @members = []
      @chapters = []

      # optional attributes: wiki, members, and chapters
      if (options[:wiki])
        @wiki = options[:wiki]
      end

      if (options[:members])
        @members = options[:members]
      end

      if (options[:chapters])
        @chapters = options[:chapters]
      end
    end

    # Returns a string representation of the Faction object.
    def to_s()
      return "faction(" + @id.to_s() + "," + @name + "," + @color + "," + @type + ")"
    end

    # Returns a hash representation of the Faction object.
    def to_hash()
      faction_hash = {"id"=>@id,"name"=>@name,"color"=>@color,"type"=>@type}
      if (@wiki != "")
        faction_hash.merge!("wiki"=>@wiki)
      end
      if (@members.length > 0)
        member_ids = []
        @members.each do |member|
          member_ids.push(member.id)
        end
        faction_hash.merge!("members"=>member_ids)
      end
      return faction_hash
    end
  end

  # A Person represents an individual character.
  class Person
    attr_accessor :id
    attr_accessor :name
    attr_accessor :style
    attr_accessor :faction
    attr_accessor :note

    def initialize(id, name, faction, options = {})
      @id = id
      @name = name
      @style = ""
      @faction = faction
      @note = ""

      # optional attributes: style and note
      if (options[:style])
        @style = options[:style]
      end

      if (options[:note])
        @note = options[:note]
      end
    end

    # Returns a string representation of the Person object.
    def to_s()
      desc = "person(" + @id.to_s() + "," + @name
      if (@style != "")
        desc += "," + @style
      end
      desc += "," + @faction.to_s()
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
      return person_hash
    end
  end

  # A Page represents a page number in the novel and its associated data.
  class Page
    attr_accessor :page
    attr_accessor :ids

    def initialize(page, ids)
      @page = page
      @ids = ids
    end

    # Returns a string representation of the Page object.
    def to_s()
      return "page(" + @page.to_s() + "," + @ids.to_s() + ")"
    end

    # Returns true if the given person id appears on this page.
    def has_person(person_id)
      return @ids.include?(person_id)
    end
  end

  # A Chapter is a collection of pages along with a title and a unique chapter number.
  class Chapter
    attr_accessor :chapter
    attr_accessor :title
    attr_accessor :pages

    def initialize(chapter, title, pages)
      @chapter = chapter
      @title = title
      @pages = pages
    end

    # Returns a string representation of the Chapter object.
    def to_s()
      desc_pages = ""
      @pages.each do |page|
        desc_pages += page.to_s() + ","
      end
      if (desc_pages[-1] == ",")
        desc_pages = desc_pages[0..-1]
      end
      return "chapter(" + @chapter.to_s() + "," + @title + "," + "[" + desc_pages + "])"
    end

    # Returns a hash representation of the Chapter object.
    def to_hash()
      return {"chapter"=>@chapter,"title"=>@title,"pages"=>@pages.map{|page| page.page},"people"=>people()}
    end

    # Computes the number of times the person with id person_id appears in this chapter.
    def num_appearances(person_id)
      total_appearances = 0
      @pages.each do |page|
        if (page.has_person(person_id))
          total_appearances += 1
        end
      end
      return total_appearances
    end

    # Returns an array of ids of all people who appear in this chapter.
    def people()
      people_ids = []
      @pages.each do |page|
        page.ids.each do |person_id|
          if (!people_ids.include?(person_id))
            people_ids.push(person_id)
          end
        end
      end
      return people_ids
    end
  end
end
