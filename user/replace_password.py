#!/usr/bin/env python3
# -*- coding: iso8859-15 -*-
import pdb
import os,sys
import pprint
import json
import string
import requests
import random
import re
appdir = os.path.abspath(os.path.dirname(__file__))
projdir = os.path.abspath(os.path.join(appdir,'..'))
if projdir not in sys.path:
    sys.path.append(appdir)
    sys.path.append(projdir)

from flask import jsonify
from flask_restx import Resource
from flask import  abort, current_app, request, redirect, render_template, make_response
from auth.auth_api import jwt_required

from config.project_globals import (DBSession,Base,metadata,engine,get_scoped_session,
    app,api)
from config.settings import FLASK_HOST,FLASK_PORT, ENV_TYPE

from config.signals import add_signals

from auth.fernet_crypto import encrypt
from user.models import User,ROLES

def replace_pass(the_id,new_password):
    db_session = get_scoped_session()
    user = db_session.query(User).filter(User.id==the_id).one()
    user.password=encrypt(new_password)
    db_session.commit()
    db_session.close()

if __name__ == "__main__":
    import pdb;pdb.set_trace()
    replace_pass(363,'nnnnnnnnnnnnnnnn')
   
