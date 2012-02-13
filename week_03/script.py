# script.py by Arbie Samong

import cgi
import os
import logging

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template

from crawler import search


class MainPage(webapp.RequestHandler):
    def get(self):

        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, {}))


class Search(webapp.RequestHandler):
    def post(self):
        action = self.request.get('action') or ''
    	site = self.request.get('site') or ''
    	
    	results = search(site)
    	
        template_values = {
            'site': site,
            'results': results,
            'action': action
        }

        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))    


application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/search', Search)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()