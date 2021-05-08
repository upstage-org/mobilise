<template>
  <DataTable :data="performances" :headers="headers">
    <template #replay="{ item }">
      <router-link
        :to="`/replay/${stage.fileLocation}/${item.id}`"
        class="button is-primary"
      >
        <i class="fas fa-video"></i>
      </router-link>
    </template>
  </DataTable>
</template>

<script>
import DataTable from "@/components/DataTable";
import { inject } from "@vue/runtime-core";
export default {
  components: { DataTable },
  setup() {
    const stage = inject("stage");
    const { performances } = stage.value;
    const headers = [
      {
        title: "Created On",
        key: "createdOn",
        type: "date",
      },
      {
        title: "Replay",
        slot: "replay",
      },
    ];
    return { performances, headers, stage };
  },
};
</script>

<style>
</style>