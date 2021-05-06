<template>
  <Messages :messages="messages" />
</template>

<script>
import Messages from "@/components/stage/Chat/Messages";
import { computed, inject } from "@vue/runtime-core";
export default {
  components: { Messages },
  setup: () => {
    const stage = inject("stage");
    const messages = computed(() => {
      if (stage.value) {
        console.log(stage.value.chats);
        return stage.value.chats
          .filter((event) => event.payload)
          .map((event) => JSON.parse(event.payload));
      }
      return [];
    });

    return { messages };
  },
};
</script>

<style>
</style>