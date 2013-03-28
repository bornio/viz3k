#! /usr/bin/env ruby
# encoding: utf-8

require "json"
require "pp"

module Viz3k
  # The Deaths class provides methods to access a collection of Death objects.
  class Deaths
    attr_reader :deaths

    def initialize(deaths_json_path)
      begin
        deaths_file = File.read(deaths_json_path)
        deaths_hash = JSON.parse(deaths_file, symbolize_names: true)
      rescue => e
        # It's possible we couldn't find the file or it didn't parse as valid JSON, etc.
        raise StandardError.new("Could not read character deaths data file : " + e.to_s())
      end

      # Hash structure mapping person ids to their death info
      @deaths = {}
      deaths_hash[:deaths].each do |death_hash|
        id = death_hash.delete(:id)
        @deaths.merge!(id => death_hash)
      end
    end

    # Returns a hash representation of the collection of death records.
    def to_hash()
      deaths = []
      @deaths.each do |id, death|
        death_hash = death.merge(:id => id)
        deaths.push(death_hash)
      end
      return {:deaths => deaths}
    end

    # Returns true if there is a death record for the specified person id, false otherwise.
    def exists?(person_id)
      if (@deaths.has_key?(person_id))
        return true
      end
      return false
    end

    # Returns the death record for the person with the requested id if found. Raises StandardError otherwise.
    def get(person_id)
      if (exists?(person_id))
        return @deaths[person_id]
      end
      raise StandardError.new("No death record found for specified person id")
    end

    # Returns a list of ids of people killed by the person with the specified id.
    def killed_by(person_id)
      ids = []
      @deaths.each do |id, death|
        if (death.has_key?(:killers))
          if (death[:killers].include?(person_id))
            ids.push(id)
          end
        end
      end
      return ids
    end

    # Returns a hash of all deaths that occurred within the specified chapter.
    def in_chapter(chapter_num)
      deaths = []
      @deaths.each do |id, death|
        if (death[:when][:chapter] == chapter_num)
          death_hash = death.merge(:id => id)
          deaths.push(death_hash)
        end
      end
      return {:deaths => deaths}
    end
  end
end
