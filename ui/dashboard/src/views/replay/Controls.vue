<template>
  <div id="replay-controls" class="card is-light">
    <div class="card-body">
      <div class="is-fullwidth my-2 has-text-centered">
        <button
          v-if="isPlaying"
          class="button is-primary is-outlined is-rounded reaction mx-1"
          @click="pause"
        >
          <i class="fas fa-pause"></i>
        </button>
        <button
          v-else
          class="button is-primary is-rounded reaction mx-1"
          @click="play"
        >
          <i class="fas fa-play"></i>
        </button>
        <teleport to="body">
          <Dropdown
            style="position: absolute; left: 24px; bottom: 64px"
            is-up
            :data="speeds"
            :render-label="(value) => value + 'x'"
            v-model="speed"
            @select="changeSpeed"
          />
        </teleport>
      </div>
    </div>
    <footer class="card-footer">
      <div class="card-footer-item" style="width: 50px">
        {{ showTimestamp(timestamp.current - timestamp.begin) }}
      </div>
      <div class="card-footer-item">
        <input
          type="range"
          class="slider is-fullwidth my-2"
          style="width: 250px"
          :min="timestamp.begin"
          :max="timestamp.end"
          :value="timestamp.current"
          @change="seek"
        />
      </div>
      <div class="card-footer-item" style="width: 50px">
        {{ showTimestamp(timestamp.end - timestamp.begin) }}
      </div>
    </footer>
  </div>
</template>

<script>
import Dropdown from "@/components/form/Dropdown";
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
export default {
  components: { Dropdown },
  setup() {
    const store = useStore();
    const timestamp = computed(() => store.state.stage.replay.timestamp);
    const isPlaying = computed(() => store.state.stage.replay.interval);
    const speed = computed(() => store.state.stage.replay.speed);
    const speeds = [0.5, 1, 2, 4, 8, 16, 32];

    const seek = (e) => {
      store.dispatch("stage/replayRecord", e.target.value);
    };

    const play = () => {
      store.dispatch("stage/replayRecord");
    };

    const pause = () => {
      store.dispatch("stage/pauseReplay");
    };

    const showTimestamp = (t) => {
      let s = Math.round(t / 10);
      let m = Math.floor(s / 60);
      s = String(s % 60).padStart(2, 0);
      return `${m}:${s}`;
    };

    const changeSpeed = (speed) => {
      store.commit("stage/SET_REPLAY", { speed });
      play();
    };

    return {
      timestamp,
      seek,
      isPlaying,
      play,
      pause,
      showTimestamp,
      speed,
      speeds,
      changeSpeed,
    };
  },
};
</script>

<style lang="scss">
#replay-controls {
  position: fixed;
  left: 16px;
  bottom: 16px;
  height: 108px;
  .button.is-rounded {
    width: 16px;
  }
  .card-footer-item {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>