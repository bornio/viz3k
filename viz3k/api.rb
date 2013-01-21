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
      # parse the data files for the lists of factions, characters, and chapters
      data_path = "./data"
      @factions = Factions.new(data_path + "/factions.json")
      @people = People.new(data_path + "/characters.json")
      @chapters = Chapters.new(data_path + "/chapters.json")

      # define relationships
      @factions.set_members(@people.people)
    end
  end
end
