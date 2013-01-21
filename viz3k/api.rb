#! /usr/bin/env ruby
# encoding: utf-8

require_relative "data"

module Viz3k
  # The Api class is the interface between the web frontend and the backend.
  class Api
    attr_reader :factions

    def initialize()
      puts "initializing api"
      data_path = "./data"
      @factions = Factions.new(data_path + "/factions.json")
    end
  end
end
