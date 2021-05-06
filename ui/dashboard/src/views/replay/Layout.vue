<template>
  <Logo id="live-logo" />
  <div id="main-content">
    <Preloader />
    <template v-if="ready">
      <Board />
      <Controls />
      <ConnectionStatus />
      <Chat />
      <AudioPlayer />
    </template>
  </div>
</template>

<script>
import Logo from "@/components/Logo";
import Chat from "@/components/stage/Chat/index";
import Board from "@/components/stage/Board";
import AudioPlayer from "@/components/stage/AudioPlayer";
import Preloader from "@/views/live/Preloader";
import ConnectionStatus from "@/views/live/ConnectionStatus";
import Controls from "./Controls";
import { useStore } from "vuex";
import { computed, provide } from "vue";
import { useRoute } from "vue-router";
export default {
  components: {
    Logo,
    Preloader,
    Chat,
    Board,
    AudioPlayer,
    ConnectionStatus,
    Controls,
  },
  setup: () => {
    const store = useStore();
    const ready = computed(
      () => store.state.stage.model && !store.state.stage.preloading
    );

    const route = useRoute();
    store.dispatch("stage/loadStage", {
      url: route.params.url,
      recordId: route.params.id,
    });

    provide("replaying", true);

    return {
      ready,
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