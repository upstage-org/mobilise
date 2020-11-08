from datetime import datetime
import logging
import os
import time
from secrets import token_urlsafe

from flask import current_app
from werkzeug.utils import secure_filename

from .models import db, Asset, AssetLicense


def save_file(file):
    filename = secure_filename(f"{time.time()}_{file.filename}")
    file_location = os.path.join(
        os.path.abspath(current_app.config["UPLOAD_DIR"]), filename
    )
    file.save(file_location)
    if not os.path.isfile(file_location):
        file_location = None
    return file_location


def create_asset(**kwargs):
    logging.info(f"Attempting to create asset: {kwargs.items()}")
    new_asset = Asset(**kwargs)
    try:
        db.session.add(new_asset)
        db.session.commit()
        logging.info(f"Asset created: {new_asset.id}")
    except Exception as e:
        logging.error(f"Failed to create asset {e}")
        db.session.rollback()
        new_asset = None
    return new_asset


def get_asset(**kwargs):
    return Asset.query.filter_by(**kwargs).first()


def create_license(**kwargs):
    logging.info(f"Attempting to create license: {kwargs.items()}")
    kwargs["access_path"] = token_urlsafe(16)
    new_license = AssetLicense(**kwargs)
    try:
        db.session.add(new_license)
        db.session.commit()
        logging.info(f"License created: {new_license.id}")
    except Exception as e:
        logging.error(f"Failed to create license {e}")
        db.session.rollback()
        new_license = None
    return new_license


def get_license(**kwargs):
    return AssetLicense.query.filter_by(**kwargs).first()


def access(path):
    lic = get_license(access_path=path)
    if lic:
        if lic.expires_on > datetime.utcnow():
            return os.path.abspath(lic.asset.file_location)
    return None
