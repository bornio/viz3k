#! /usr/bin/env ruby
# encoding: utf-8

require "json"
require "pp"

module Viz3k
  # The Factions class provides methods to access a collection of Faction objects.
  class Factions
    attr_reader :factions

    def initialize(factions_json_path)
      begin
        factions_file = File.read(factions_json_path)
        factions_json = JSON.parse(factions_file)
      rescue => e
        # It's possible we couldn't find the file or it didn't parse as valid JSON, etc.
        raise StandardError.new("Could not read factions data file : " + e.to_s())
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
        faction.members = people.select{|person| person.in_faction?(faction.id)}
      end
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

      # optional attributes
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
        members_hash = {"members"=>@members.map{|member| member.to_hash()}}
        faction_hash.merge!(members_hash)
      end
      return faction_hash
    end
  end
end
