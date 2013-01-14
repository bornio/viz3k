#! /usr/bin/env python
# -*- coding: utf-8 -*-

# we use bottle as the web framework
from bottle import abort, route, run, static_file, template
from viz3k import data, coappear

# path to the data files
data_path = "./data"

# route for static asset files (e.g. *.js, *.css)
@route('/assets/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root='./assets')

# route for static data files (*.json)
@route('/data/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root='./data')

# route for 3rd party static files (e.g. jquery, bootstrap, angular, d3)
@route('/lib/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root='./lib')

# main page for whole site
@route('/')
def index():
    return static_file('index.html', root='./views')

# first level paths
@route('/<feature>')
def index(feature):
    return static_file(feature + '.html', root='./views')

# coappearance graphs
@route('/coappear/chapter/<chapter_num:int>')
def index(chapter_num=1):
    if (valid_chapter(chapter_num)):
        return static_file('coappear/chapter.html', root='./views')
    else:
        abort(404, "Chapter " + str(chapter_num) + " does not exist, or has not been added yet.")

# route for dynamically computed coappearance graph data
@route('/coappear/data/chapter<chapter_num:int>')
def index(chapter_num=1):
    # catch the exception if the chapter number is invalid
    try:
        coappear_json = coappear.Coappear(data_path).coappearances([chapter_num])
        return coappear_json
    except ValueError as ve:
        abort(404, str(ve))

# route for faction info
@route('/factions/data/<query>')
def index(query):
    # abort if query is not recognized
    if (query == "all-factions"):
        factions = data.Faction.from_json(data_path + "/factions.json")
        people = data.Person.from_json(data_path + "/characters.json")
        result_json = data.factions_info(factions, people)
        return result_json
    else:
        abort(404, "Invalid request : '" + query + "'")

# checks whether the given chapter number refers to a valid chapter (i.e. a chapter for which we have data)
def valid_chapter(chapter_num):
    return coappear.Coappear(data_path).has_chapter(chapter_num)

# for development purposes, just run the dev server on localhost:8080
run(host='localhost', port=8080)
