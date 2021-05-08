import { gql } from "graphql-request";
import { stageGraph } from ".";
import { createClient } from "./graphql";

const client = createClient('stage_graphql')

export const stageFragment = gql`
  fragment stageFragment on Stage {
    id
    name
    fileLocation
    description
    permission
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
  createStage: async (variables) => {
    let result = await client.request(gql`
      mutation CreateStage($name: String, $fileLocation: String) {
        createStage(input: {name: $name, fileLocation: $fileLocation}) {
          stage {
            id
          }
        }
      }
    `, variables);
    if (result) {
      variables.id = result.createStage.stage.id
      result = await stageGraph.updateStage(variables)
      return result.updateStage.stage
    }
  },
  updateStage: (variables) => client.request(gql`
    mutation UpdateStage($id: ID!, $name: String, $description: String, $fileLocation: String, $status: String, $playerAccess: String) {
      updateStage(input: {id: $id, name: $name, description: $description, fileLocation: $fileLocation, status: $status, playerAccess: $playerAccess}) {
        stage {
          ...stageFragment
        }
      }
    }
    ${stageFragment}
  `, variables),
  sweepStage: (variables) => client.request(gql`
    mutation SweepStage($id: ID!) {
      sweepStage(input: {id: $id}) {
        success
        performanceId
      }
    }
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
  getStage: (id) => client.request(gql`
    query ListStage($id: ID) {
      stageList(id: $id) {
        edges {
          node {
            ...stageFragment
            chats {
              payload
              created
            }
            performances {
              id
              createdOn
            }
          }
        }
      }
    }
    ${stageFragment}
  `, { id }),
  loadStage: (fileLocation, performanceId) => client.request(gql`
    query ListStage($fileLocation: String, $performanceId: Int) {
      stageList(fileLocation: $fileLocation) {
        edges {
          node {
            ...stageFragment
            events(performanceId: $performanceId) {
              id
              topic
              payload
              mqttTimestamp
            }
          }
        }
      }
    }
    ${stageFragment}
  `, { fileLocation, performanceId }).then(response => response.stageList.edges[0]?.node),
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
    query AssetList($id: ID, $nameLike: String, $assetType: String) {
      assetList(id: $id, nameLike: $nameLike, assetType: $assetType, sort: ID_DESC) {
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
      avatars: assetList(assetType: "avatar") {
        edges {
          node {
            ...assetFragment
          }
        }
      }
      props: assetList(assetType: "prop") {
        edges {
          node {
            ...assetFragment
          }
        }
      }
      backdrops: assetList(assetType: "backdrop") {
        edges {
          node {
            ...assetFragment
          }
        }
      }
      audios: assetList(assetType: "audio") {
        edges {
          node {
            ...assetFragment
          }
        }
      }
      streams: assetList(assetType: "stream") {
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