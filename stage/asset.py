import os
from utils.graphql_utils import CountableConnection
import uuid

from sqlalchemy.orm import joinedload

from config.project_globals import appdir, ScopedSession
from asset.models import Asset as AssetModel, AssetType as AssetTypeModel
from graphene_sqlalchemy import SQLAlchemyObjectType
from graphql_relay.node.node import from_global_id
import graphene
from base64 import b64decode
from flask_jwt_extended import jwt_required, get_jwt_identity

storagePath = 'ui/static/assets'


class Asset(SQLAlchemyObjectType):
    db_id = graphene.Int(description="Database ID")

    class Meta:
        model = AssetModel
        model.db_id = model.id
        interfaces = (graphene.relay.Node,)
        connection_class = CountableConnection


class AssetType(SQLAlchemyObjectType):
    db_id = graphene.Int(description="Database ID")

    class Meta:
        model = AssetTypeModel
        model.db_id = model.id
        interfaces = (graphene.relay.Node,)


class UploadMedia(graphene.Mutation):
    """Mutation to upload a media."""
    asset = graphene.Field(
        lambda: Asset, description="Media uploaded by this mutation.")

    class Arguments:
        name = graphene.String(
            required=True, description="Name of the media")
        base64 = graphene.String(
            required=True, description="Base64 encoded content of the uploading media")
        media_type = graphene.String(
            description="Avatar/prop/backdrop,... default to just a generic media", default_value='media')
        filename = graphene.String(
            required=True, description="Original file name")

    @jwt_required()
    def mutate(self, info, name, base64, media_type, filename):
        current_user_id = get_jwt_identity()
        absolutePath = os.path.dirname(appdir)

        with ScopedSession() as local_db_session:
            asset_type = local_db_session.query(AssetTypeModel).filter(
                AssetTypeModel.name == media_type).first()
            if not asset_type:
                asset_type = AssetTypeModel(
                    name=media_type, file_location=media_type)
                local_db_session.add(asset_type)
                local_db_session.flush()

            # Save base64 to file
            filename, file_extension = os.path.splitext(filename)
            unique_filename = uuid.uuid4().hex + file_extension
            mediaDirectory = os.path.join(
                absolutePath, storagePath, asset_type.file_location)
            if not os.path.exists(mediaDirectory):
                os.makedirs(mediaDirectory)
            with open(os.path.join(mediaDirectory, unique_filename), "wb") as fh:
                fh.write(b64decode(base64.split(',')[1]))

            file_location = os.path.join(
                asset_type.file_location, unique_filename)
            asset = AssetModel(
                name=name,
                file_location=file_location,
                asset_type_id=asset_type.id,
                owner_id=current_user_id
            )
            local_db_session.add(asset)
            local_db_session.flush()
            local_db_session.commit()
            asset = local_db_session.query(AssetModel).options(joinedload(AssetModel.asset_type), joinedload(AssetModel.owner)).filter(
                AssetModel.id == asset.id).first()
            return UploadMedia(asset=asset)


class UpdateMedia(graphene.Mutation):
    """Mutation to upload a media."""
    asset = graphene.Field(
        lambda: Asset, description="Media updated by this mutation.")

    class Arguments:
        id = graphene.ID(
            required=True, description="ID of the media")
        name = graphene.String(
            required=True, description="Name of the media")
        media_type = graphene.String(
            description="Avatar/prop/backdrop,... default to just a generic media", default_value='media')
        description = graphene.String(
            description="JSON serialized metadata of the media")

    def mutate(self, info, id, name, media_type, description):
        with ScopedSession() as local_db_session:
            asset_type = local_db_session.query(AssetTypeModel).filter(
                AssetTypeModel.name == media_type).first()
            if not asset_type:
                asset_type = AssetTypeModel(
                    name=media_type, file_location=media_type)
                local_db_session.add(asset_type)
                local_db_session.flush()

            id = from_global_id(id)[1]
            asset = local_db_session.query(AssetModel).filter(
                AssetModel.id == id).first()
            if asset:
                asset.name = name
                asset.asset_type = asset_type
                asset.description = description

            local_db_session.flush()
            local_db_session.commit()
            asset = local_db_session.query(AssetModel).filter(
                AssetModel.id == asset.id).first()
            return UploadMedia(asset=asset)
