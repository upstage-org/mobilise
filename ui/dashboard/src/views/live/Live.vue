<template>
  <section
    id="live-stage"
    class="hero bg-cover has-background-primary-light is-fullheight"
  >
    <Board />
    <ConnectionStatus />
    <Toolbox v-if="loggedIn" />
    <Chat />
    <AudioPlayer />
  </section>
</template>

<script>
import Chat from "@/components/stage/Chat/index";
import Toolbox from "@/components/stage/Toolbox";
import Board from "@/components/stage/Board";
import AudioPlayer from "@/components/stage/AudioPlayer";
import ConnectionStatus from "./ConnectionStatus";
import { useStore } from "vuex";
import { computed, onMounted, onUnmounted } from "vue";

export default {
  components: {
    Chat,
    Toolbox,
    ConnectionStatus,
    Board,
    AudioPlayer,
  },
  setup: () => {
    const store = useStore();

    onMounted(() => {
      store.dispatch("stage/connect");
    });

    onUnmounted(() => {
      store.dispatch("stage/disconnect");
    });

    window.addEventListener("beforeunload", () => {
      store.dispatch("stage/disconnect");
    });

    const loggedIn = computed(() => store.getters["auth/loggedIn"]);

    return { loggedIn };
  },
};
</script>

<style lang="scss">
#live-stage {
  *:not(input, textarea) {
    -webkit-user-select: none; /* Safari */
    user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
  }
}
</style>