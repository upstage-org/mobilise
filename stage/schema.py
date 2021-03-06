# -*- coding: iso8859-15 -*-
from stage.asset import Asset, AssetType, UpdateMedia, UploadMedia
from config.project_globals import (DBSession, Base, metadata, engine, get_scoped_session,
                                    app, api, ScopedSession)
from utils import graphql_utils
from flask_graphql import GraphQLView
from asset.models import Stage as StageModel, StageAttribute as StageAttributeModel
from config.settings import VERSION
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField
from graphene import relay
from graphql_relay.node.node import from_global_id
from sqlalchemy import desc
import graphene
import sys
import os

appdir = os.path.abspath(os.path.dirname(__file__))
projdir = os.path.abspath(os.path.join(appdir, '..'))
if projdir not in sys.path:
    sys.path.append(appdir)
    sys.path.append(projdir)


class StageAttribute:
    name = graphene.String(description="Stage Name")
    description = graphene.String(description="Stage Description")
    owner_id = graphene.String(description="User ID of the owner")
    file_location = graphene.String(description="Unique File Location")
    status = graphene.String(description="Live/Upcoming/Rehearsal")
    media = graphene.String(description="Media attached to stage")
    config = graphene.String(description="Stage configurations")


class StageAttributes(SQLAlchemyObjectType):
    class Meta:
        model = StageAttributeModel


class Stage(SQLAlchemyObjectType):
    db_id = graphene.Int(description="Database ID")

    class Meta:
        model = StageModel
        model.db_id = model.id
        interfaces = (relay.Node,)
        connection_class = graphql_utils.CountableConnection


class StageConnectionField(SQLAlchemyConnectionField):
    RELAY_ARGS = ['first', 'last', 'before', 'after']

    @classmethod
    def get_query(cls, model, info, sort=None, **args):
        query = super(StageConnectionField, cls).get_query(
            model, info, sort, **args)
        for field, value in args.items():
            if field == 'id':
                _type, _id = from_global_id(value)
                query = query.filter(getattr(model, field) == _id)
            elif len(field) > 5 and field[-4:] == 'like':
                query = query.filter(
                    getattr(model, field[:-5]).ilike(f"%{value}%"))
            elif field not in cls.RELAY_ARGS:
                query = query.filter(getattr(model, field) == value)
        return query


class CreateStageInput(graphene.InputObjectType, StageAttribute):
    """Arguments to create a stage."""
    pass


class CreateStage(graphene.Mutation):
    """Mutation to create a stage."""
    stage = graphene.Field(
        lambda: Stage, description="Stage created by this mutation.")

    class Arguments:
        input = CreateStageInput(required=True)

    def mutate(self, info, input):
        if not input.name or not input.file_location or not input.owner_id:
            raise Exception('Please fill in all required fields')

        data = graphql_utils.input_to_dictionary(input)

        stage = StageModel(**data)
        # Add validation for non-empty passwords, etc.
        with ScopedSession() as local_db_session:
            local_db_session.add(stage)
            local_db_session.flush()
            stage_id = stage.id
            local_db_session.commit()

            stage = DBSession.query(StageModel).filter(
                StageModel.id == stage_id).first()
            return CreateStage(stage=stage)


class UpdateStageInput(graphene.InputObjectType, StageAttribute):
    id = graphene.ID(required=True, description="Global Id of the stage.")


class UpdateStage(graphene.Mutation):
    """Mutation to update a stage."""
    stage = graphene.Field(
        lambda: Stage, description="Stage updated by this mutation.")

    class Arguments:
        input = UpdateStageInput(required=True)

    # decorate this with jwt login decorator.
    def mutate(self, info, input):
        data = graphql_utils.input_to_dictionary(input)
        with ScopedSession() as local_db_session:

            stage = local_db_session.query(StageModel).filter(
                StageModel.id == data['id']
            ).first()
            for key, value in data.items():
                if hasattr(stage, key):
                    setattr(stage, key, value)
                elif value:
                    attribute = stage.attributes.filter(
                        StageAttributeModel.name == key
                    ).first()
                    if attribute:
                        attribute.description = value
                    else:
                        attribute = StageAttributeModel(
                            stage_id=data['id'], name=key, description=value
                        )
                        local_db_session.add(attribute)

            local_db_session.commit()
            stage = DBSession.query(StageModel).filter(
                StageModel.id == data['id']).first()

            return UpdateStage(stage=stage)


class Mutation(graphene.ObjectType):
    createStage = CreateStage.Field()
    updateStage = UpdateStage.Field()
    uploadMedia = UploadMedia.Field()
    updateMedia = UpdateMedia.Field()


class Query(graphene.ObjectType):
    node = relay.Node.Field()
    stageList = StageConnectionField(
        Stage.connection, id=graphene.ID(), name_like=graphene.String(), file_location=graphene.String())
    assetList = StageConnectionField(
        Asset.connection, id=graphene.ID(), name_like=graphene.String(), asset_type_id=graphene.ID())
    assetTypeList = StageConnectionField(
        AssetType.connection, id=graphene.ID(), name_like=graphene.String())


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
stage_schema = graphene.Schema(query=Query, mutation=Mutation)
app.add_url_rule(
    f'/{VERSION}/stage_graphql/', view_func=GraphQLView.as_view(
        "stage_graphql", schema=stage_schema,
        graphiql=True
    )
)
