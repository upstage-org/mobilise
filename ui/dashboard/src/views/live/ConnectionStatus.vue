<template>
  <div id="connection-status">
    <FirefoxWarning />

    <span
      class="tag is-light is-small"
      :class="{
        'is-danger': status === 'LIVE',
        'is-warning': status === 'CONNECTING',
      }"
    >
      <template v-if="replaying">
        <span class="icon">
          <i ref="dot" class="fas fa-circle"></i>
        </span>
        <span class="status-text">REPLAYING</span>
      </template>
      <template v-else>
        <span class="icon" v-show="status !== 'OFFLINE'">
          <i ref="dot" class="fas fa-circle"></i>
        </span>
        <span class="icon" v-show="status === 'OFFLINE'">
          <i class="far fa-circle"></i>
        </span>
        <span class="status-text">{{ status }}</span>
      </template>
    </span>

    <Popover>
      <template #trigger>
        <span class="tag is-dark is-small">
          <span class="icon">
            <i class="fas fa-user"></i>
          </span>
          <span>{{ players.length }}</span>
          <span class="icon">
            <i class="fas fa-desktop"></i>
          </span>
          <span>{{ audiences.length }}</span>
        </span>
      </template>
      <Session v-for="player in players" :key="player" :session="player" />
      <Session
        v-for="audience in audiences"
        :key="audience"
        :session="audience"
      />
    </Popover>
  </div>
</template>

<script>
import { useStore } from "vuex";
import anime from "animejs";
import { ref, computed, onMounted, inject } from "vue";
import Popover from "@/components/Popover";
import Session from "./Session";
import FirefoxWarning from "./FirefoxWarning";

export default {
  components: { Popover, Session, FirefoxWarning },
  setup: () => {
    const store = useStore();
    const dot = ref();
    const status = computed(() => store.state.stage.status);
    const players = computed(() =>
      store.state.stage.sessions.filter((s) => s.isPlayer)
    );
    const audiences = computed(() =>
      store.state.stage.sessions.filter((s) => !s.isPlayer)
    );
    const replaying = inject("replaying");

    onMounted(() => {
      anime({
        targets: dot.value,
        opacity: [1, 0, 1],
        duration: 2000,
        loop: true,
      });
    });

    return {
      status,
      dot,
      players,
      audiences,
      replaying,
    };
  },
};
</script>

<style scoped lang="scss">
#connection-status {
  position: fixed;
  right: 12px;
  top: 50px;
  width: 250px;
  text-align: center;
  z-index: 2;

  @media screen and (max-width: 767px) {
    right: unset;
    top: 8px;
    left: 0;
  }
}
</style>