# encoding: utf-8

require "benchmark"
require "spec_helper"
require "api"

module Viz3k
  describe "Api" do
    before(:all) do
      # initialize the api
      @api = Api.new()
    end

    describe "#faction_json" do
      describe "when given a valid faction id, should return a JSON object for that faction" do
        before(:each) do
          faction_id = 0
          faction = @api.faction_json(faction_id)
          @faction_hash = JSON.parse(faction, symbolize_names: true)
        end

        it "which contains the key 'id'" do
          @faction_hash.has_key?(:id).should == true
        end

        it "which contains the key 'name'" do
          @faction_hash.has_key?(:name).should == true
        end

        it "which contains the key 'color'" do
          @faction_hash.has_key?(:color).should == true
        end

        it "which contains the key 'type'" do
          @faction_hash.has_key?(:type).should == true
        end

        it "which contains the key 'members'" do
          @faction_hash.has_key?(:members).should == true
        end
      end
    end

    describe "#coappearances_in_chapter" do
      before(:each) do
        @elapsed = Benchmark.realtime do
          @coappearances = @api.coappearances_in_chapter(1)
        end
      end

      it "returns a hash" do
        @coappearances.is_a?(Hash).should == true
      end

      it "returns an object containing the key :nodes" do
        @coappearances.has_key?(:nodes).should == true
      end

      it "returns an object containing the key :links" do
        @coappearances.has_key?(:links).should == true
      end

      it "completes in less than 0.1 second" do
        @elapsed.should < 0.1
      end
    end
  end
end
