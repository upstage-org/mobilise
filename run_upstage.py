#!/usr/bin/env python3
# -*- coding: iso8859-15 -*-

from gevent import monkey
_mp = monkey.patch_all()

import pdb
import os,sys
from gevent.pywsgi import WSGIServer
import pprint

appdir = os.path.abspath(os.path.dirname(__file__))
projdir = os.path.abspath(os.path.join(appdir,'..'))
if projdir not in sys.path:
    sys.path.append(appdir)
    sys.path.append(projdir)

from config.project_globals import Base,metadata,engine,app,DBSession
from config.settings import FLASK_HOST,FLASK_PORT, RUNFROM_PORT, ENV_TYPE
from config.signals import add_signals

from auth import auth
from user import user,schema
from asset import asset
from asset.views import assets
from license.views import licenses
from stage import schema
from config import schema

# Below, duplicate names are actually app names.
# See __init__.py in each directory to verify app name.
#from apidir import apiname, etc

add_signals(app)

app.register_blueprint(auth)
app.register_blueprint(user)
app.register_blueprint(asset)

if __name__ == "__main__":
    # This is used for running two instances locally: one for testing, one to 
    # do async authn while testing locally. This requires two host files,
    # and explicitly setting HARDCODED_HOSTNAME.

    try:
        if RUNFROM_PORT:
            WSGIServer((FLASK_HOST, RUNFROM_PORT), app).serve_forever()
        else:
            WSGIServer((FLASK_HOST, FLASK_PORT), app).serve_forever()
    finally:
        DBSession.close()
