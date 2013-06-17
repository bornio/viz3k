#! /usr/bin/env ruby
# encoding: utf-8

require "spec_helper"
require "coappearances"
require "open-uri"

module Viz3k
  describe "Coappearances" do
    describe "#coappearances" do
      describe "when there are no people, factions, or pages" do
        before(:all) do
          people_hash = {:people => []}
          factions_hash = {:factions => []}
          allegiances_hash = {:allegiances => []}
          @people = People.new(people_hash, allegiances_hash)
          @factions = Factions.new(factions_hash)
          @coappearances = Coappearances.new(@people, @factions)
          @network = @coappearances.coappearances([])
        end

        it "returns an empty network with 0 nodes and 0 links" do
          @network[:nodes].should == []
          @network[:links].should == []
        end
      end
    end

    describe "#convert_node" do
      before(:each) do
        @neighbors = Set.new([1,2])
        @node = {:neighbors => @neighbors}
        @converted = Coappearances.convert_node(@node)
      end

      it "returns a copy of node with an array of neighbors instead of a set" do
        @converted[:neighbors].should == @node[:neighbors].to_a()
      end

      it "does not modify the original node's neighbors set'" do
        @node[:neighbors].should == @neighbors
      end
    end
  end
end
