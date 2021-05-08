import os
import subprocess
from config.settings import SQLALCHEMY_DATABASE_URI

event_archive = subprocess.run(
    ["python3", os.path.join(os.path.dirname(__file__), "event_archive"), SQLALCHEMY_DATABASE_URI]
)