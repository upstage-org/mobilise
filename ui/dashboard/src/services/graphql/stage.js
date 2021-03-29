import { gql } from "graphql-request";
import { createClient } from "./graphql";

const client = createClient('stage_graphql')

export const stageFragment = gql`
  fragment stageFragment on Stage {
    id
    name
    fileLocation
    description
    owner {
      id
      username
      displayName
    }
    attributes {
      id
      name
      description
    }
  }
`

export const assetFragment = gql`
  fragment assetFragment on Asset {
    id
    name
    description
    assetType {
      id
      name
    }
    owner {
      id
      username
      displayName
    }
    createdOn
    fileLocation
    dbId
  }
`

export default {
  createStage: (variables) => client.request(gql`
    mutation CreateStage($name: String, $description: String, $ownerId: String, $fileLocation: String) {
      createStage(input: {name: $name, description: $description, ownerId: $ownerId, fileLocation: $fileLocation}) {
        stage {
          id
          name
        }
      }
    }
  `, variables),
  updateStage: (variables) => client.request(gql`
    mutation UpdateStage($id: ID!, $name: String, $description: String, $ownerId: String, $fileLocation: String, $status: String) {
      updateStage(input: {id: $id, name: $name, description: $description, ownerId: $ownerId, fileLocation: $fileLocation, status: $status}) {
        stage {
          ...stageFragment
        }
      }
    }
    ${stageFragment}
  `, variables),
  stageList: (variables) => client.request(gql`
    query ListStage($id: ID, $nameLike: String, $fileLocation: String) {
      stageList(id: $id, nameLike: $nameLike, fileLocation: $fileLocation) {
        totalCount
        edges {
          node {
            ...stageFragment
          }
        }
      }
    }
    ${stageFragment}
  `, variables),
  uploadMedia: (variables) => client.request(gql`
    mutation uploadMedia($name: String!, $base64: String!, $mediaType: String, $filename: String!) {
      uploadMedia(name: $name, base64: $base64, mediaType: $mediaType, filename: $filename) {
        asset {
          ...assetFragment
        }
      }
    }
    ${assetFragment}
  `, variables),
  mediaList: (variables) => client.request(gql`
    query AssetList($id: ID, $nameLike: String, $assetTypeId: ID) {
      assetList(id: $id, nameLike: $nameLike, assetTypeId: $assetTypeId, sort: ID_DESC) {
        edges {
          node {
            ...assetFragment
          }
        }
      }
    }
    ${assetFragment}
  `, variables),
  assetTypeList: (variables) => client.request(gql`
    query AssetTypeList($id: ID, $nameLike: String) {
      assetTypeList(id: $id, nameLike: $nameLike) {
        edges {
          node {
            id
            dbId
            name
          }
        }
      }
    }
  `, variables),
  saveStageMedia: (id, media) => client.request(gql`
    mutation UpdateStage($id: ID!, $media: String) {
      updateStage(input: {id: $id, media: $media}) {
        stage {
          ...stageFragment
        }
      }
    }
    ${stageFragment}
  `, { id, media }),
  saveStageConfig: (id, config) => client.request(gql`
    mutation UpdateStage($id: ID!, $config: String) {
      updateStage(input: {id: $id, config: $config}) {
        stage {
          ...stageFragment
        }
      }
    }
    ${stageFragment}
  `, { id, config }),
  assignableMedia: () => client.request(gql`
    query AssignableMedia {
      avatars: assetList(assetTypeId: 2) {
        edges {
          node {
            ...assetFragment
          }
        }
      }
      props: assetList(assetTypeId: 3) {
        edges {
          node {
            ...assetFragment
          }
        }
      }
      backdrops: assetList(assetTypeId: 4) {
        edges {
          node {
            ...assetFragment
          }
        }
      }
      audios: assetList(assetTypeId: 5) {
        edges {
          node {
            ...assetFragment
          }
        }
      }
      streams: assetList(assetTypeId: 6) {
        edges {
          node {
            ...assetFragment
          }
        }
      }
    }
    ${assetFragment}
  `),
  updateMedia: (variables) => client.request(gql`
    mutation updateMedia($id: ID!, $name: String!, $mediaType: String, $description: String) {
      updateMedia(id: $id, name: $name, mediaType: $mediaType, description: $description) {
        asset {
          id
        }
      }
    }
  `, variables),
}