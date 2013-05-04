#! /usr/bin/env ruby
# encoding: utf-8

require "spec_helper"
require "coappearances"
require "open-uri"

module Viz3k
  describe "Coappearances" do
    describe "when there are no people or factions" do
      before(:all) do
        people_hash = {:people => []}
        factions_hash = {:factions => []}
        allegiances_hash = {:allegiances => []}
        @people = People.new(people_hash, allegiances_hash)
        @factions = Factions.new(factions_hash)
        @coappearances = Coappearances.new(@people, @factions)
      end

      describe "when pages is empty" do
        before(:each) do
          pages = []
          @network = @coappearances.coappearances(pages)
        end

        it "should return an empty network with 0 nodes and 0 links" do
          @network[:nodes].should == []
          @network[:links].should == []
        end
      end
    end
  end
end
