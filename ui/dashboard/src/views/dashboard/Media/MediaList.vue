<template>
  <DataTable :data="mediaList" :headers="headers">
    <template #preview="{ item }">
      <Asset :asset="item" />
    </template>
    <template #stage="{ item }">
      <span v-for="(stage, index) in item.stages" :key="stage">
        <router-link :to="`/dashboard/stage-management/${stage.id}/`">
          {{ stage.name }}
        </router-link>
        <span v-if="index < item.stages.length - 1">, </span>
      </span>
    </template>
    <template #edit="{ item }">
      <EditMedia :media="item" />
    </template>
  </DataTable>
</template>

<script>
import { inject } from "@vue/runtime-core";
import { absolutePath } from "@/utils/common";
import Asset from "@/components/Asset";
import DataTable from "@/components/DataTable/index";
import EditMedia from "./EditMedia";
import { displayName } from "@/utils/auth";

export default {
  components: { Asset, EditMedia, DataTable },
  setup: () => {
    const mediaList = inject("mediaList");

    const headers = [
      {
        title: "Preview",
        slot: "preview",
        align: "center",
      },
      {
        title: "Name",
        key: "name",
        align: "center",
      },
      {
        title: "Type",
        render: (item) =>
          item.assetType.name === "media" ? "" : item.assetType.name,
      },
      {
        title: "Owner",
        render: (item) => displayName(item.owner),
      },
      {
        title: "Stage",
        slot: "stage",
      },
      {
        title: "Date",
        type: "date",
        key: "createdOn",
      },
      {
        title: "Edit",
        slot: "edit",
      },
    ];

    return { mediaList, absolutePath, headers };
  },
};
</script>

<style>
.media-column {
  position: relative;
}
.type-tag {
  position: absolute;
  z-index: 10;
  top: 20px;
  right: 0;
}
td.preview {
  width: 300px;
}
td.preview img {
  height: 50px;
}
</style>