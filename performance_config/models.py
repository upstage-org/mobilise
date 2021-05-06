# -*- coding: iso8859-15 -*-
from datetime import datetime
import os
import sys

appdir = os.path.abspath(os.path.dirname(__file__))
projdir = os.path.abspath(os.path.join(appdir,'..'))
if projdir not in sys.path:
    sys.path.append(appdir)
    sys.path.append(projdir)

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, DateTime, String, BigInteger, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship

from config.project_globals import Base,metadata,DBSession,db
from user.models import User
from asset.models import Asset,Stage

'''
A performance is comprised of one or more Scenes. Scenes belong to a specific "parent stage",
and have an ordering. Scenes direct the back end on which assets are needed when, in a performance. 
Assets follow a hierarchy when rendering for a performance.

In cases where a performance has only one scene, stage and scene will be synonymous. 
'''
class ParentStage(Base,db.Model):
    '''
    This maps all 'children' in a hierarchy of assets for a stage.
    Assets also have children.
    Not yet sure if this maps only the first tier, or all assets to a stage.
    I could see the benefit of mapping them all, for quick asset collection.
    '''
    __tablename__ = "parent_stage"
    id = Column(BigInteger, primary_key=True)
    stage_id = Column(Integer, ForeignKey(Stage.id), nullable=False, default=0)
    child_asset_id = Column(Integer, ForeignKey(Asset.id), nullable=False, default=0)
    stage = relationship(Stage, foreign_keys=[stage_id])
    child_asset = relationship(Asset, foreign_keys=[child_asset_id])

class ParentAsset(Base,db.Model):
    '''
    This maps a parent to a child asset, so that rendering can follow a hierarchy.
    The topmost parent asset is a stage.
    '''
    __tablename__ = "parent_asset"
    id = Column(BigInteger, primary_key=True)
    asset_id = Column(Integer, ForeignKey(Asset.id), nullable=False, default=0)
    child_asset_id = Column(Integer, ForeignKey(Asset.id), nullable=False, default=0)
    asset = relationship(Asset, foreign_keys=[asset_id])
    child_asset = relationship(Asset, foreign_keys=[child_asset_id])

class Performance(Base,db.Model):
    __tablename__ = "performance"
    id = Column(BigInteger, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    stage_id = Column(Integer, ForeignKey(Stage.id), nullable=False, default=0)
    stage = relationship(Stage, foreign_keys=[stage_id])
    created_on = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_on = Column(DateTime, nullable=False, default=None)

class PerformanceConfig(Base,db.Model):
    __tablename__ = "performance_config"
    id = Column(BigInteger, primary_key=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey(User.id), nullable=False, default=0)
    description = Column(Text, nullable=False)
    # This can contain embedded HTML/CSS.
    splash_screen_text = Column(Text, nullable=True, default=None)
    # comma-separated list of animation URLs
    splash_screen_animation_urls = Column(Text, nullable=True, default=None)
    created_on = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_on = Column(DateTime, nullable=False, default=None)

    def get_animation_urls(self):
        return self.splash_screen_animation_urls.split(',')

class Scene(Base,db.Model):
    __tablename__ = "scene"
    id = Column(BigInteger, primary_key=True)
    name = Column(Text, nullable=False)
    scene_order = Column(Integer, index=True, nullable=False, default=0)
    owner_id = Column(Integer, ForeignKey(User.id), nullable=False, default=0)
    description = Column(Text, nullable=False)
    created_on = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_on = Column(DateTime, nullable=False, default=None)
    parent_stage_id = Column(Integer, ForeignKey(ParentStage.id), nullable=False, default=0)
    # A scene can only belong to one performance. They shouldn't be reused, although
    # maybe we should let them be copied?
    performance_config_id = Column(Integer, ForeignKey(PerformanceConfig.id), nullable=False, default=0)
    owner = relationship(User, foreign_keys=[owner_id])
    parent_stage = relationship(ParentStage, foreign_keys=[parent_stage_id])
    performance_config = relationship(PerformanceConfig, foreign_keys=[performance_config_id])

class PerformanceMQTTConfig(Base,db.Model):
    # This holds the MQTT server configuration for one performance, to make connecting easier.
    # There may be > 1 MQTT connection in a performance.
    __tablename__ = "performance_mqtt_config"
    id = Column(BigInteger, primary_key=True)
    owner_id = Column(Integer, ForeignKey(User.id), nullable=False, default=0)
    ip_address = Column(Text, nullable=False)
    websocket_port = Column(Integer, nullable=False, default=0)
    webclient_port = Column(Integer, nullable=False, default=0)
    '''
    Performance connections will be namespaced by a unique string, so a user can be
    connected to more than one stage at once.
    The topic_name should be modified when this expires, so it can be reused
    in the future. MQTT will send /performance/topic_name as the leading topic.
    '''
    topic_name = Column(Text, unique=True, nullable=False)
    username = Column(Text, nullable=False)
    password = Column(Text, nullable=False)
    created_on = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_on = Column(DateTime, nullable=False, default=None)
    performance_config_id = Column(Integer, ForeignKey(PerformanceConfig.id), nullable=False, default=0)
    owner = relationship(User, foreign_keys=[owner_id])
    performance_config = relationship(PerformanceConfig, foreign_keys=[performance_config_id])
