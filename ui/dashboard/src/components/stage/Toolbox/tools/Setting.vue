<template>
  <div v-if="chatVisibility" @click="showChat(false)">
    <div class="icon is-large">
      <Icon src="clear.svg" size="36" />
    </div>
    <span class="tag is-light is-block">Hide chat</span>
  </div>
  <div v-else @click="showChat(true)">
    <div class="icon is-large">
      <Icon src="change-nickname.svg" size="36" />
    </div>
    <span class="tag is-light is-block">Show chat</span>
  </div>
  <div>
    <div class="icon is-large">
      <ColorPicker
        v-model="backdropColor"
        @update:modelValue="sendBackdropColor"
      />
    </div>
    <span class="tag is-light is-block p-0">Backdrop Color</span>
  </div>
</template>

<script>
import Icon from "@/components/Icon";
import ColorPicker from "@/components/form/ColorPicker";
import { useStore } from "vuex";
import { computed } from "@vue/runtime-core";
export default {
  components: { Icon, ColorPicker },
  setup: () => {
    const store = useStore();
    const chatVisibility = computed(
      () => store.state.stage.settings.chatVisibility
    );

    const showChat = (value) => {
      store.dispatch("stage/showChatBox", value);
    };

    const backdropColor = computed(() => store.state.stage.backdropColor);
    const sendBackdropColor = (color) => {
      store.dispatch("stage/setBackdropColor", color);
    };

    return { showChat, chatVisibility, sendBackdropColor, backdropColor };
  },
};
</script>

<style>
</style>