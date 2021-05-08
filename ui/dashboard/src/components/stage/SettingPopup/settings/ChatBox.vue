<template>
  <div style="width: 500px">
    <EmojiInput
      v-model="message"
      placeholder="Type message"
      @keyup.enter="sendChat"
    />
  </div>
</template>

<script>
import EmojiInput from "@/components/form/EmojiInput";
import { ref } from "@vue/reactivity";
import { useStore } from "vuex";
export default {
  components: { EmojiInput },
  emits: ["close"],
  setup: (props, { emit }) => {
    const store = useStore();
    const message = ref("");
    const sendChat = () => {
      if (message.value.trim()) {
        store.dispatch("stage/sendChat", message.value).then(() => {
          message.value = "";
          emit("close");
        });
      }
    };

    return { message, sendChat };
  },
};
</script>

<style>
</style>