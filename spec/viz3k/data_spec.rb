#! /usr/bin/env ruby
# encoding: utf-8

require 'spec_helper'
require 'data'

describe "data" do
  before(:all) do
    data_path = "./data"
    @factions = Viz3k::Factions.new(data_path + "/factions.json")
  end

  describe "factions.json" do
    it "should not contain any factions with the same id" do
      ids = []
      @factions.factions.each do |faction|
        ids.should_not include(faction.id)
        ids.push(faction.id)
      end
    end

    it "should not contain any factions with the same name as one another" do
      names = []
      @factions.factions.each do |faction|
        names.should_not include(faction.name)
        names.push(faction.name)
      end
    end
  end
end
