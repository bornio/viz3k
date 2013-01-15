#! /usr/bin/env python
# -*- coding: utf-8 -*-

# we use bottle as the web framework
from bottle import abort, route, run, static_file, template
from viz3k import api, coappear

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
    if (api.chapter_exists(chapter_num)):
        return static_file('coappear/chapter.html', root='./views')
    else:
        abort(404, "Chapter " + str(chapter_num) + " does not exist, or has not been added yet.")

# route for coappearance-related data queries
@route('/coappear/data/chapter/<chapter_num:int>')
def index(chapter_num=1):
    # catch the exception if the chapter number is invalid
    try:
        coappear_json = coappear.Coappear().coappearances([chapter_num])
        return coappear_json
    except ValueError as ve:
        abort(404, str(ve))

# factions
@route('/factions/<faction_num:int>')
def index(faction_num=1):
    if (api.faction_exists(faction_num)):
        return static_file('factions/faction.html', root='./views')
    else:
        abort(404, "Faction " + str(faction_num) + " does not exist, or has not been added yet.")

# routes for faction-related data queries
@route('/factions/data/<query>')
def index(query):
    if (query == "all-factions"):
        return api.factions_people_info()
    else:
        # abort if query is not recognized
        abort(404, "Invalid request : '" + query + "'")

@route('/factions/data/<faction_num:int>/<query>')
def index(faction_num, query):
    if (query == "members"):
        if (api.faction_exists(faction_num)):
            return api.faction_people(faction_num)
        else:
            abort(404, "Faction " + str(faction_num) + " does not exist, or has not been added yet.")
    elif (query == "info"):
        try:
            return api.faction_info(faction_num)
        except ValueError as ve:
            abort(404, str(ve))
    else:
        # abort if query is not recognized
        abort(404, "Invalid request : '" + query + "'")

# for development purposes, just run the dev server on localhost:8080
run(host='localhost', port=8080)
