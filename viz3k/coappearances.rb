module Viz3k
  # Generates coappearance networks for characters.
  class Coappearances
    def initialize(people, factions)
      @people = people
      @factions = factions
    end

    # Generates a coappearance network from the specified list of pages. Each character is a node in the network. Any
    # two characters who appear on the same page are linked in the network.
    def coappearances(pages)
      # create nodes for every person who shares a page with any other person
      # sort the nodes in order of id BEFORE creating links, as node indices for links must be based on node ordering
      nodes = sort_nodes_by_id(create_nodes(pages))

      # now create links for every pair of nodes representing people who appear on the same page
      links = sort_links(create_links(pages, nodes))

      # the complete hash representation with nodes + links together
      return {:nodes => nodes, :links => links}
    end

    def create_nodes(pages)
      nodes = []
      page_nums = pages.map{|page| page.page}
      pages.each do |page|
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
              nodes.push(create_node(person, num_links, page_nums))
            end
          end
        end
      end

      return nodes
    end

    def sort_nodes_by_id(nodes)
      return nodes.sort!(){|a,b| a["id"] <=> b["id"]}
    end

    def create_node(person, num_links, page_nums)
      # set the person's faction based on the page range
      faction_id = person.primary_faction(page_nums)
      faction = @factions.get(faction_id)
      node = {"id"=>person.id,"name"=>person.name,"group"=>faction.id,"faction"=>faction.name,
                     "color"=>faction.color,"links"=>num_links}
      if (person.style != "")
        node.merge!("style"=>person.style)
      end
      return node
    end

    def create_links(pages, nodes)
      # generate a list of node indices
      node_indices = {}
      nodes.each_with_index do |node, node_index|
        node_indices.merge!(node["id"]=>node_index)
      end

      links = []
      pages.each do |page|
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

      return links
    end

    # Sort the links by source, with target as tie-breaker.
    def sort_links(links)
      return links.sort(){|a,b| [a["source"],a["target"]] <=> [b["source"],b["target"]]}
    end
  end
end
