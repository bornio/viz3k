#! /usr/bin/env ruby
# encoding: utf-8

require "json"
require "pp"

module Viz3k
  # The Factions class provides methods to access a collection of Factions.
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
        faction = Faction.new(faction_json["id"],faction_json["name"],faction_json["color"],faction_json["type"])
        @factions.push(faction)
      end
    end

    # Returns true if the Faction with the given id was found, false otherwise.
    def exists(faction_id)
      @factions.each do |faction|
        if (faction.id == faction_id)
          return true
        end
        return false
      end
    end

    # Returns the Faction with the requested id if found. Raises RangeError otherwise.
    def get(faction_id)
      @factions.each do |faction|
        if (faction.id == faction_id)
          return faction
        end
      end
      raise RangeError.new("No faction found with specified id")
    end

    # Returns a JSON representation of the collection of Faction objects.
    def to_json()
      factions_json = @factions.map{|faction| faction.to_json()}
      return {"factions"=>factions_json}.to_json()
    end

    # Sets the members of all Faction objects in this collection from the ids of an array of Person objects.
    def set_members(people)
      @factions.each do |faction|
        faction.members = people.select{|person| person.faction == faction.id}
      end
    end
  end

  # A Faction represents a group of individuals in the Three Kingdoms.
  class Faction
    attr_accessor :id
    attr_accessor :name
    attr_accessor :color
    attr_accessor :type
    attr_accessor :members
    attr_accessor :chapters

    def initialize(id, name, color, type, options = {})
      @id = id
      @name = name
      @color = color
      @type = type
      @members = []
      @chapters = []

      # optional relationship attributes: members and chapters
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

    # Returns a JSON representation of the Faction object.
    def to_json()
      faction_json = {"id"=>@id,"name"=>@name,"color"=>@color}
      member_ids = []
      @members.each do |member|
        member_ids.push(member.id)
      end
      faction_json.merge("members"=>member_ids)
    end
  end
end
