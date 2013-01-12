#! /usr/bin/env python
# -*- coding: utf-8 -*-

# we use bottle as the web framework
from bottle import abort, route, run, static_file, template
from viz3k.coappear import Coappear

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

# route for coappearance main page
@route('/coappear')
def index():
    return static_file('coappear.html', root='./views')

# route for coappearance graphs
@route('/coappear/chapter/<chapter_num:int>')
def index(chapter_num=1):
    if (valid_chapter(chapter_num)):
        return static_file('coappear/chapter.html', root='./views')
    else:
        abort(404, "Chapter " + str(chapter_num) + " does not exist, or has not been added yet.")

# route for dynamically computed coappearance graph data (returned in json format)
@route('/coappear/data/chapter<chapter_num:int>.json')
def index(chapter_num=1):
    # catch the exception if the chapter number is invalid
    try:
        coappear_json = Coappear(data_path).coappearances([chapter_num])
        return coappear_json
    except ValueError as ve:
        abort(404, str(ve))

# checks whether the given chapter number refers to a valid chapter (i.e. a chapter for which we have data)
def valid_chapter(chapter_num):
    return Coappear(data_path).has_chapter(chapter_num)

# for development purposes, just run the dev server on localhost:8080
run(host='localhost', port=8080)
