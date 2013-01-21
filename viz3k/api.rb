#! /usr/bin/env ruby
# encoding: utf-8

require_relative "data"

module Viz3k
  # The Api class is the interface between the web frontend and the backend.
  class Api
    attr_reader :factions
    attr_reader :people
    attr_reader :chapters

    def initialize()
      puts "initializing api"
      data_path = "./data"
      @factions = Factions.new(data_path + "/factions.json")
      @people = People.new(data_path + "/characters.json")
      @chapters = Chapters.new(data_path + "/chapters.json")
    end
  end
end
