#! /usr/bin/env python
# -*- coding: utf-8 -*-

# we use bottle as the web framework
from bottle import abort, route, run, static_file, template

# route for static files (e.g. *.js, *.css, *.json)
@route('/static/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root='./static')

# route for coappearance graphs
@route('/coappear/chapter<chapter:int>')
def index(chapter=1):
    # for now, hard-code a 404 response for chapters that don't exist
    if (chapter <= 14):
        return template('coappear/chapter', chapter = chapter)
    else:
        abort(404, "Chapter " + str(chapter) + " does not exist.")

# for development purposes, just run the dev server on localhost:8080
run(host='localhost', port=8080)
