<template>
  <DataTable :data="data" :headers="headers">
    <template #name="{ item }">
      <span class="has-text-weight-bold">{{ item.name }}</span>
    </template>
    <template #detail="{ item }">
      <Modal>
        <template #trigger>
          <button class="button is-light is-small">
            <i class="fas fa-lg fa-eye has-text-primary" />
          </button>
        </template>
        <template #header>Stage Detail</template>
        <template #content><Detail :stage="item" /></template>
        <template #footer><ActionButtons :stage="item" /></template>
      </Modal>
    </template>
    <template #manage="{ item }">
      <template
        v-if="item.permission === 'editor' || item.permission === 'owner'"
      >
        <router-link
          :to="`/dashboard/stage-management/${item.id}/`"
          class="button is-light is-small"
          data-tooltip="Go to stage management"
        >
          <i class="fa fa-lg fa-cog has-text-primary"></i>
        </router-link>
        <router-link
          :to="`/dashboard/stage-management/${item.id}/`"
          class="button is-light is-small"
          data-tooltip="Duplicate stage"
        >
          <i class="fa fa-lg fa-clone has-text-warning"></i>
        </router-link>
        <router-link
          :to="`/dashboard/stage-management/${item.id}/`"
          class="button is-light is-small"
          data-tooltip="Delete stage"
          v-if="item.permission === 'owner'"
        >
          <i class="fa fa-lg fa-trash has-text-danger"></i>
        </router-link>
      </template>
      <span v-else data-tooltip="You don't have edit permission on this stage">
        🙅‍♀️🙅‍♂️
      </span>
    </template>
    <template #enter="{ item }">
      <router-link
        :to="`/live/${item.fileLocation}`"
        class="button is-small is-primary"
      >
        <span>ENTER</span>
        <span class="icon">
          <i class="fas fa-chevron-right"></i>
        </span>
      </router-link>
    </template>
  </DataTable>
</template>

<script>
import DataTable from "@/components/DataTable/index";
import Modal from "../Modal";
import ActionButtons from "./ActionButtons";
import Detail from "./Detail";
import { displayName } from "@/utils/auth";

export default {
  components: { DataTable, Modal, ActionButtons, Detail },
  props: { data: Array },
  setup: () => {
    const headers = [
      {
        title: "Stage name",
        description: "Name (url)",
        slot: "name",
      },
      {
        title: "Owner",
        description: "Creator of the stage",
        render: (item) => displayName(item.owner),
      },
      {
        title: "Access",
        description: "Your permited access to this stage",
        render: (item) =>
          item.permission[0].toUpperCase() + item.permission.substr(1),
      },
      {
        title: "Detail",
        description: "Duplicate/Manage stage",
        slot: "detail",
        align: "center",
      },
      {
        title: "Manage Stage",
        slot: "manage",
        align: "center",
      },
      {
        title: "",
        slot: "enter",
        align: "center",
      },
    ];

    return { headers };
  },
};
</script>

<style scoped>
i.fas {
  cursor: pointer;
}
</style>