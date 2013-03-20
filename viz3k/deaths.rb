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
        deaths_hash = JSON.parse(deaths_file)
      rescue => e
        # It's possible we couldn't find the file or it didn't parse as valid JSON, etc.
        raise StandardError.new("Could not read character deaths data file : " + e.to_s())
      end

      # Hash structure mapping person ids to their death info
      @deaths = {}
      deaths_hash["deaths"].each do |death_hash|
        death = {:when => death_hash["when"], :cause => death_hash["cause"], :killer => death_hash["killer"]}
        @deaths.merge!(death_hash["id"] => death)
      end
    end

    # Returns a hash representation of the collection of death records.
    def to_hash()
      deaths = []
      @deaths.each do |id, death|
        death_hash = {"id" => id, "when" => death[:when], "cause" => death[:cause], "killer" => death[:killer]}
        deaths.push(death_hash)
      end
      return {"deaths" => deaths}
    end

    # Returns the death record for the person with the requested id if found. Raises StandardError otherwise.
    def get(person_id)
      if (@deaths.has_key?(person_id))
        return @deaths[person_id]
      end
      raise StandardError.new("No death record found for specified person id")
    end
  end
end
