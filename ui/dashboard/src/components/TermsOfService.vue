<template>
  <Modal>
    <template #trigger>
      <a>Terms of Service</a>
    </template>
    <template #header>Terms of Service</template>
    <template #content>
      <Skeleton v-if="loading" />
      <div v-else v-html="content"></div>
    </template>
  </Modal>
</template>

<script>
import { ref } from "@vue/reactivity";
import { computed, watch } from "@vue/runtime-core";
import Modal from "@/components/Modal";
import Skeleton from "@/components/Skeleton";
import marked from "marked";
import { useStore } from "vuex";

export default {
  components: { Modal, Skeleton },
  setup: () => {
    const store = useStore();
    const url = computed(() => store.getters["config/termsOfService"]);
    const content = ref();
    const loading = ref(true);

    watch(
      url,
      async (value) => {
        if (value) {
          const response = await fetch(url.value);
          const text = await response.text();
          content.value = marked(text);
          loading.value = false;
        }
      },
      { immediate: true }
    );

    return { content, loading };
  },
};
</script>

<style>
.modal-card-title {
  margin-bottom: 0 !important;
}
</style>