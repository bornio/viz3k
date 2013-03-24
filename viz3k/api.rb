#! /usr/bin/env ruby
# encoding: utf-8

require_relative "chapters"
require_relative "factions"
require_relative "people"
require_relative "deaths"

module Viz3k
  # The Api class is the interface between the web frontend and the backend.
  class Api
    attr_reader :factions
    attr_reader :people
    attr_reader :chapters
    attr_reader :deaths

    def initialize()
      # parse the data files for the lists of factions, characters, and chapters
      data_path = "./data"
      @factions = Factions.new(data_path + "/factions.json")
      @chapters = Chapters.new(data_path + "/chapters.json")
      @people = People.new(data_path + "/characters.json", data_path + "/allegiances.json")
      @deaths = Deaths.new(data_path + "/deaths.json")

      # define relationships
      @factions.set_members(@people.people)

      # set primary faction for each character
      @people.set_primary_factions(@chapters)
    end

    # Gets a JSON representation of the faction with the requested id.
    def factions_json(faction_id)
      return @factions.get(faction_id).to_hash().to_json()
    end

    # Gets a JSON representation of all people along with some additional info.
    def people_json()
      results = []

      # count how many pages each person appeared on in the novel.
      @people.people.each_index do |person_id|
        results.push(person_hash(person_id))
      end

      return {"people" => results}.to_json()
    end

    # Gets a JSON representation of the person with the requested id.
    def person_json(person_id)
      return person_hash(person_id).to_json()
    end

    def person_hash(person_id)
      result = @people.get(person_id).to_hash()

      # count how many pages this person appeared on in the novel.
      num_appearances = 0
      @chapters.chapters.each do |chapter|
        num_appearances += chapter.num_appearances(result["id"])
      end
      result.merge!("num_appearances" => num_appearances)

      # also include death info for this person, if any
      if (@deaths.exists?(person_id))
        result.merge!("death" => @deaths.get(person_id))
      end

      return result
    end

    # Gets a JSON representation of the death record for the specified person id.
    def death_json(person_id)
      return @deaths.get(person_id).to_json()
    end

    # Gets a JSON representation of the list of people killed by the person with the specified id.
    def killed_by(person_id)
      ids = @deaths.killed_by(person_id)
      people_killed = []
      ids.each do |id|
        if @people.exists(id)
          people_killed.push(person_hash(id))
        end
      end
      return {"killed_by" => people_killed}.to_json()
    end

    # Generates a coappearance graph using data from the specified chapters.
    def coappearances(chapter_nums)
      nodes = []
      links = []
      node_indices = {}

      # raise an error if any chapter numbers in chapter_nums are invalid
      chapter_nums.each do |chapter_num|
        if (!@chapters.exists(chapter_num))
          raise StandardError.new("No chapter found with specified number")
        end
      end

      # create nodes for every person who shares a page with any other person
      @chapters.chapters.each do |chapter|
        if (chapter_nums.include?(chapter.chapter))
          chapter.pages.each do |page|
            if (page.ids.length() > 1)
              page.ids.each do |person_id|
                # get the corresponding person object
                person = @people.get(person_id)

                # number of links for this person on this page
                num_links = page.ids.length() - 1
                
                # add num_links to existing node (if any) for this person
                found = false
                nodes.each do |node|
                  if (node["id"] == person_id)
                    node["links"] += num_links
                    found = true
                    break
                  end
                end

                # otherwise append new node if there isn't one yet for this person
                if (!found)
                  # set the person's faction from granular per-chapter info if available
                  # otherwise just use their primary faction
                  faction_id = person.faction
                  if (person.faction_for_chapter.has_key?(chapter.chapter))
                    faction_id = person.faction_for_chapter[chapter.chapter]
                  end
                  faction = @factions.get(faction_id)

                  person_hash = {"id"=>person.id,"name"=>person.name,"group"=>faction.id,"faction"=>faction.name,
                                 "color"=>faction.color,"links"=>num_links}
                  if (person.style != "")
                    person_hash.merge!("style"=>person.style)
                  end
                  nodes.push(person_hash)
                end
              end
            end
          end
        end
      end

      # sort the nodes in order of id BEFORE creating links, as node indices for links must be based on node ordering
      nodes.sort!(){|a,b| a["id"] <=> b["id"]}
      nodes.each_with_index do |node, node_index|
        node_indices.merge!(node["id"]=>node_index)
      end

      # now create links for every pair of nodes representing people who appear on the same page
      @chapters.chapters.each do |chapter|
        if (chapter_nums.include?(chapter.chapter))
          chapter.pages.each do |page|
            (0..page.ids.length()-1).each do |i|
              (i+1..page.ids.length()-1).each do |j|
                id0 = page.ids[i]
                id1 = page.ids[j]

                # lower id is always the link source, higher id always the target
                if (id0 > id1)
                  id0 = page.ids[j]
                  id1 = page.ids[i]
                end

                # if a link already exists between two people, increment the value of the link
                exists = false
                links.each do |link|
                  if (link["source"] == node_indices[id0] && link["target"] == node_indices[id1])
                    link["value"] += 1
                    exists = true
                    break
                  end
                end

                # otherwise, add a new link
                if (!exists)
                  links.push({"source"=>node_indices[id0],"target"=>node_indices[id1],"value"=>1})
                end
              end
            end
          end
        end
      end

      # sort the links by source, with target as tie-breaker
      links.sort!(){|a,b| [a["source"],a["target"]] <=> [b["source"],b["target"]]}

      # the complete JSON representation with nodes + links together
      return {"nodes"=>nodes,"links"=>links}.to_json()
    end
  end
end
