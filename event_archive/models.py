import datetime

from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects import postgresql


Base = declarative_base()


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    topic = Column(String)
    mqtt_timestamp = Column(Float, index=True)
    performance_id = Column(Integer, index=True)
    payload = Column(postgresql.JSON)
    created = Column(DateTime, default=datetime.datetime.utcnow, index=True)
