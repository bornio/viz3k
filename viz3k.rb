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

# coappearance graphs
get '/coappear/chapter/:chapter_num' do
  File.read("views/coappear/chapter.html")
end

# faction data
get '/data/factions' do
  content_type :json
  api.factions.to_json()
end

# people data
get '/data/people' do
  content_type :json
  api.people.to_json()
end

# chapter data
get '/data/chapters' do
  content_type :json
  api.chapters.to_json()
end

# root level routes
get '/:feature' do
  File.read("views/#{params[:feature]}.html")
end
