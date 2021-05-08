<template>
  <Logo id="live-logo" />
  <div id="main-content">
    <Preloader />
    <template v-if="ready">
      <Board />
      <ConnectionStatus />
      <Toolbox v-if="canPlay" />
      <Chat />
      <AudioPlayer />
      <LoginPrompt />
      <SettingPopup />
    </template>
  </div>
</template>

<script>
import Logo from "@/components/Logo";
import SettingPopup from "@/components/stage/SettingPopup";
import Chat from "@/components/stage/Chat/index";
import Toolbox from "@/components/stage/Toolbox";
import Board from "@/components/stage/Board";
import AudioPlayer from "@/components/stage/AudioPlayer";
import Preloader from "./Preloader";
import LoginPrompt from "./LoginPrompt";
import ConnectionStatus from "./ConnectionStatus";
import { useStore } from "vuex";
import { computed, onUnmounted } from "vue";
import { useRoute } from "vue-router";
export default {
  components: {
    Logo,
    Preloader,
    LoginPrompt,
    SettingPopup,
    Chat,
    Toolbox,
    Board,
    AudioPlayer,
    ConnectionStatus,
  },
  setup: () => {
    const store = useStore();
    const ready = computed(
      () => store.state.stage.model && !store.state.stage.preloading
    );

    const route = useRoute();
    store.dispatch("stage/loadStage", { url: route.params.url }).then(() => {
      store.dispatch("stage/connect");
    });

    onUnmounted(() => {
      store.dispatch("stage/disconnect");
    });

    window.addEventListener("beforeunload", () => {
      store.dispatch("stage/disconnect");
    });

    const canPlay = computed(() => store.getters["stage/canPlay"]);

    return {
      ready,
      canPlay,
    };
  },
};
</script>

<style lang="scss">
#main-content {
  min-height: calc(100vh - 120px);
}
#live-stage {
  *:not(input, textarea) {
    -webkit-user-select: none; /* Safari */
    user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
  }
}
#live-logo {
  position: fixed;
  right: 0px;
  z-index: 1;
  max-width: 200px;

  @media screen and (min-width: 1024px) {
    img {
      max-height: unset;
    }
  }
}
</style>