#! /usr/bin/env ruby
# encoding: utf-8

require "json"
require "pp"

module Viz3k
  # The Chapters class provides methods to access a collection of Chapter objects.
  class Chapters
    attr_reader :chapters

    def initialize(chapters_json_path)
      begin
        chapters_file = File.read(chapters_json_path)
        chapters_json = JSON.parse(chapters_file)
      rescue => e
        # It's possible we couldn't find the file or it didn't parse as valid JSON, etc.
        raise StandardError.new("Could not read chapters data file : " + e.to_s())
      end

      @chapters = []
      chapters_json["chapters"].each do |chapter_json|
        pages = []
        pages_json = chapter_json["pages"]
        pages_json.each do |page_json|
          pages.push(Page.new(page_json["page"],page_json["ids"]))
        end
        chapter = Chapter.new(chapter_json["chapter"],chapter_json["title"],pages)
        @chapters.push(chapter)
      end
    end

    # Returns a hash representation of the collection of Chapter objects.
    def to_hash()
      chapters_hash = @chapters.map{|chapter| chapter.to_hash()}
      return {"chapters"=>chapters_hash}
    end

    # Returns true if the Chapter with the given chapter number was found, false otherwise.
    def exists(chapter_num)
      @chapters.each do |chapter|
        if (chapter.chapter == chapter_num)
          return true
        end
      end
      return false
    end

    # Returns the Chapter with the requested number if found. Raises StandardError otherwise.
    def get(chapter_num)
      @chapters.each do |chapter|
        if (chapter.chapter == chapter_num)
          return chapter
        end
      end
      raise StandardError.new("No chapter found with specified chapter number")
    end

    # Returns the total number of times the person with the given id appears among all the chapters contained.
    def num_appearances(person_id)
      total_appearances = 0
      @chapters.each do |chapter|
        total_appearances += chapter.num_appearances(person_id)
      end
      return total_appearances
    end

    # Returns a list of chapters and pages the person with the given id appears on.
    def appearances(person_id)
      pages = []
      @chapters.each do |chapter|
        chapter_appearances = chapter.appearances(person_id)
        if (chapter_appearances.length() > 0)
          pages.push({:chapter => chapter.chapter, :pages => chapter.appearances(person_id)})
        end
      end
      return pages
    end
  end

  # A Page represents a page number in the novel and its associated data.
  class Page
    attr_accessor :page
    attr_accessor :ids

    def initialize(page, ids)
      @page = page
      @ids = ids
    end

    # Returns a string representation of the Page object.
    def to_s()
      return "page(" + @page.to_s() + "," + @ids.to_s() + ")"
    end

    # Returns true if the given person id appears on this page.
    def has_person(person_id)
      return @ids.include?(person_id)
    end
  end

  # A Chapter is a collection of pages along with a title and a unique chapter number.
  class Chapter
    attr_accessor :chapter
    attr_accessor :title
    attr_accessor :pages

    def initialize(chapter, title, pages)
      @chapter = chapter
      @title = title
      @pages = pages
    end

    # Returns a string representation of the Chapter object.
    def to_s()
      desc_pages = ""
      @pages.each do |page|
        desc_pages += page.to_s() + ","
      end
      if (desc_pages[-1] == ",")
        desc_pages = desc_pages[0..-1]
      end
      return "chapter(" + @chapter.to_s() + "," + @title + "," + "[" + desc_pages + "])"
    end

    # Returns a hash representation of the Chapter object.
    def to_hash()
      return {"chapter"=>@chapter,"title"=>@title,"pages"=>@pages.map{|page| page.page},"people"=>people()}
    end

    # Computes the number of times the person with id person_id appears in this chapter.
    def num_appearances(person_id)
      total_appearances = 0
      @pages.each do |page|
        if (page.has_person(person_id))
          total_appearances += 1
        end
      end
      return total_appearances
    end

    # Returns a list of pages from this chapter on which the person with the given id appears.
    def appearances(person_id)
      pages = []
      @pages.each do |page|
        if (page.has_person(person_id))
          pages.push(page.page)
        end
      end
      return pages
    end

    # Returns an array of ids of all people who appear in this chapter.
    def people()
      people_ids = []
      @pages.each do |page|
        page.ids.each do |person_id|
          if (!people_ids.include?(person_id))
            people_ids.push(person_id)
          end
        end
      end
      return people_ids
    end
  end
end
