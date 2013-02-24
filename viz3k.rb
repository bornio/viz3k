#! /usr/bin/env ruby
# encoding: utf-8

require "sinatra"
require_relative "viz3k/version"
require_relative "viz3k/api"

# initialize the api to access the backend
api = Viz3k::Api.new()

# get real time log output from Heroku
$stdout.sync = true

# main splash page
get '/' do
  File.read("views/index.html")
end

# chapter pages
get '/coappear/chapter/:chapter_num' do
  begin
    chapter_num = Integer(params[:chapter_num])
  rescue ArgumentError => e
    raise Sinatra::NotFound.new()
  end
  if (api.chapters.exists(chapter_num))
    File.read("views/coappear/chapter.html")
  else
    raise Sinatra::NotFound.new()
  end
end

# faction pages
get '/factions/:faction_num' do
  begin
    faction_num = Integer(params[:faction_num])
  rescue ArgumentError => e
    raise Sinatra::NotFound.new()
  end
  if (api.factions.exists(faction_num))
    File.read("views/factions/faction.html")
  else
    raise Sinatra::NotFound.new()
  end
end

# faction data
get '/data/factions' do
  content_type :json
  api.factions.to_hash().to_json()
end

get '/data/factions/:faction_num' do
  content_type :json
  begin
    faction_num = Integer(params[:faction_num])
  rescue ArgumentError => e
    raise Sinatra::NotFound.new()
  end
  if (api.factions.exists(faction_num))
    api.factions_json(faction_num)
  else
    raise Sinatra::NotFound.new()
  end
end

# people data
get '/data/people' do
  content_type :json
  api.people.to_hash().to_json()
end

get '/data/people/:query' do
  content_type :json
  query = params[:query]
  begin
    api.people_json([query])
  rescue StandardError => e
    halt 400
  end
end

# chapter data
get '/data/chapters' do
  content_type :json
  api.chapters.to_hash().to_json()
end

# coappearances data
get '/data/coappear/chapter/:chapter_num' do
  content_type :json
  begin
    chapter_num = Integer(params[:chapter_num])
  rescue ArgumentError => e
    raise Sinatra::NotFound.new()
  end
  if (api.chapters.exists(chapter_num))
    return api.coappearances([chapter_num])
  else
    raise Sinatra::NotFound.new()
  end
end

# root level routes
get '/:feature' do
  file_path = "views/#{params[:feature]}.html"
  if (File.exists?(file_path))
    File.read(file_path)
  else
    raise Sinatra::NotFound.new()
  end
end
