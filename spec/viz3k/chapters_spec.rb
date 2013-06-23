# encoding: utf-8

require "spec_helper"
require "chapters"

module Viz3k
  describe "Chapters" do
    before(:all) do
      chapters_hash =
      { :chapters =>
        [
          {
            :chapter => 1, :title => "Chapter 1", :pages =>
            [
              { :page => 1, :ids => [] },
              { :page => 2, :ids => [] },
              { :page => 3, :ids => [] }
            ]
          },
          {
            :chapter => 2, :title => "Chapter 2", :pages =>
            [
              { :page => 4, :ids => [] },
              { :page => 5, :ids => [] },
              { :page => 6, :ids => [] }
            ]
          },
          {
            :chapter => 5, :title => "Chapter 5", :pages =>
            [
              { :page => 20, :ids => [] },
              { :page => 21, :ids => [] },
              { :page => 22, :ids => [] }
            ]
          }
        ]
      }
      @chapters = Chapters.new(chapters_hash)
    end

    describe "#numbers" do
      before(:each) do
        @chapter_nums = @chapters.numbers()
      end

      it "returns an array of all chapter numbers" do
        @chapter_nums.should == [1,2,5]
      end
    end
  end
end
