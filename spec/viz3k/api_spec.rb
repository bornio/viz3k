# encoding: utf-8

require 'spec_helper'
require 'api'

describe "api" do
  before(:all) do
    # initialize the api
    @api = Viz3k::Api.new()
  end

  describe "#faction_json" do
    describe "when given a valid faction id, should return a JSON object for that faction" do
      before(:all) do
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
end
