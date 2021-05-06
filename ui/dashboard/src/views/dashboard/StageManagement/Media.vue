<template>
  <div class="columns">
    <div class="column">
      <Dropdown
        :data="mediaTypes"
        :renderLabel="(item) => item.label"
        :renderValue="(item) => item.value"
        v-model="filter.type"
      />
    </div>
    <div class="column">
      <SaveButton :loading="saving" @click="saveMedia" />
    </div>
  </div>

  <MultiSelectList
    :loading="loading"
    :titles="['Available Media', 'Selected Media']"
    :data="filteredMediaList"
    v-model="selectedMedia"
  >
    <template #render="{ item }">
      <span class="tag is-light is-small type-tag">
        {{ item.assetType.name[0].toUpperCase() }}
      </span>
      <div class="card-image">
        <Asset :asset="item" />
      </div>
      <header class="card-header">
        <p class="card-header-title">{{ item.name }}</p>
      </header>
    </template>
  </MultiSelectList>

  <teleport to="#media-menu">
    <ul>
      <li
        v-for="type in mediaTypes.slice(1)"
        :key="type.value"
        @click="filter.type = type.value"
      >
        <a :class="{ 'is-active': type.value === filter.type }">{{
          type.label
        }}</a>
      </li>
    </ul>
  </teleport>
</template>

<script>
import MultiSelectList from "@/components/MultiSelectList";
import Asset from "@/components/Asset";
import SaveButton from "@/components/form/SaveButton";
import Dropdown from "@/components/form/Dropdown";
import { stageGraph } from "@/services/graphql";
import {
  useAttribute,
  useMutation,
  useQuery,
} from "@/services/graphql/composable";
import { reactive, ref } from "@vue/reactivity";
import { computed, inject, watchEffect } from "@vue/runtime-core";
export default {
  components: { MultiSelectList, Asset, SaveButton, Dropdown },
  setup: () => {
    const stage = inject("stage");
    const selectedMedia = ref([]);
    const { loading, data } = useQuery(stageGraph.assignableMedia);
    const { loading: saving, save } = useMutation(stageGraph.saveStageMedia);

    const mediaList = computed(() => {
      if (!data.value) return [];
      const { avatars, props, backdrops, audios, streams } = data.value;
      const mediaList = []
        .concat(
          avatars.edges,
          props.edges,
          backdrops.edges,
          audios.edges,
          streams.edges
        )
        .map((edge) => edge.node);
      return mediaList;
    });

    watchEffect(() => {
      const savedMedia = useAttribute(stage, "media", true);
      if (!savedMedia.value || !mediaList.value) return;
      selectedMedia.value = mediaList.value.filter((media) => {
        return savedMedia.value.some((m) => m.src === media.fileLocation);
      });
    });

    const saveMedia = async () => {
      const payload = JSON.stringify(
        selectedMedia.value.map((media) => {
          const type = media.assetType.name;
          const attributes = media.description
            ? JSON.parse(media.description)
            : {};
          if (type === "stream") {
            return {
              name: media.name,
              type,
              url: media.fileLocation,
            };
          } else {
            return {
              name: media.name,
              type,
              src: media.fileLocation,
              ...attributes,
            };
          }
        })
      );
      await save("Media saved successfully!", stage.value.id, payload);
    };

    const mediaTypes = [
      { label: "All media", value: undefined },
      {
        label: "Avatar",
        value: "avatar",
      },
      {
        label: "Prop",
        value: "prop",
      },
      {
        label: "Backdrop",
        value: "backdrop",
      },
      { label: "Audio", value: "audio" },
      { label: "Stream", value: "stream" },
    ];
    const filter = reactive({});
    const filteredMediaList = computed(() => {
      let list = mediaList.value;
      if (filter.type) {
        list = list.filter((media) => media.assetType.name === filter.type);
      }
      return list;
    });

    return {
      loading,
      mediaList,
      selectedMedia,
      saveMedia,
      saving,
      mediaTypes,
      filter,
      filteredMediaList,
    };
  },
};
</script>

<style>
</style>