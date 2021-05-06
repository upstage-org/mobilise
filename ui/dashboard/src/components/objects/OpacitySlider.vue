<template>
  <input
    class="opacity-slider slider is-fullwidth"
    :class="{
      'is-primary': sliderMode === 'opacity',
      'is-warning': sliderMode === 'animation',
      'is-danger': sliderMode === 'speed',
    }"
    step="0.01"
    min="0"
    max="1"
    :value="value"
    type="range"
    :style="{
      top: '-26px',
      left: '-15px',
      width: object.h + 'px',
    }"
    v-show="active"
    @change="handleChange"
    @mousedown.stop="keepActive"
    @mouseover.stop="keepActive"
    @mouseup.stop="keepActive"
  />
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
export default {
  props: ["active", "object", "sliderMode"],
  emits: ["update:active"],
  setup: (props, { emit }) => {
    const store = useStore();
    const maxFrameSpeed = 50;
    const maxMoveSpeed = 500;
    const value = computed(() => {
      switch (props.sliderMode) {
        case "animation":
          return props.object.autoplayFrames == 0
            ? 0
            : maxFrameSpeed / props.object.autoplayFrames;
        case "speed":
          return props.object.moveSpeed == 0
            ? 0
            : maxMoveSpeed / props.object.moveSpeed;
        default:
          return props.object.opacity;
      }
    });

    const sendChangeOpacity = (e) => {
      store.dispatch("stage/shapeObject", {
        ...props.object,
        opacity: e.target.value,
      });
    };

    const calcAutoplayFrames = (e) =>
      e.target.value == 0 ? 0 : maxFrameSpeed / e.target.value;

    const sendChangeFrameAnimationSpeed = (e) => {
      store.dispatch("stage/shapeObject", {
        ...props.object,
        autoplayFrames: calcAutoplayFrames(e),
      });
    };

    const calcMoveSpeed = (e) =>
      e.target.value == 0 ? 10000 : maxMoveSpeed / e.target.value;

    const sendChangeMoveSpeed = (e) => {
      store.dispatch("stage/shapeObject", {
        ...props.object,
        moveSpeed: calcMoveSpeed(e),
      });
    };

    const keepActive = () => {
      emit("update:active", true);
    };

    const handleChange = (e) => {
      keepActive();
      switch (props.sliderMode) {
        case "opacity":
          sendChangeOpacity(e);
          break;
        case "animation":
          sendChangeFrameAnimationSpeed(e);
          break;
        case "speed":
          sendChangeMoveSpeed(e);
          break;
      }
    };

    return { keepActive, handleChange, value };
  },
};
</script>

<style>
.opacity-slider {
  position: absolute;
  transform: rotate(270deg) translateX(-100%);
  transform-origin: left;
  z-index: 20;
}
</style>