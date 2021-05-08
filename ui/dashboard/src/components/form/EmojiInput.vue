<template>
  <div style="position: relative">
    <ElasticInput
      v-if="!pickerOnly"
      v-bind="$attrs"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      @ref="(el) => (input = el)"
      @submit="$emit('submit')"
      :style="{
        'border-top-right-radius': '20px',
        'border-bottom-right-radius': '20px',
        'padding-right': '40px',
      }"
    />
    <div
      v-click-outside="() => (isPicking = false)"
      class="emoji-picker-wrapper"
    >
      <button
        type="button"
        class="icon is-right clickable button is-rounded"
        :class="{
          'is-loading': loading,
          'is-primary': !className,
          [className]: true,
        }"
        :disabled="loading"
        :style="style"
        @click="isPicking = !isPicking"
      >
        <slot name="icon">
          <span class="icon" v-if="!loading">
            <Icon size="48" src="emoji.svg" />
          </span>
        </slot>
      </button>
      <transition :css="false" @enter="pickerEnter">
        <emoji-picker v-show="isPicking" class="light" />
      </transition>
    </div>
  </div>
</template>

<script>
import "emoji-picker-element";
import { ref } from "vue";
import anime from "animejs";
import Icon from "@/components/Icon";
import ElasticInput from "@/components/form/ElasticInput";

export default {
  props: ["loading", "modelValue", "pickerOnly", "style", "className"],
  emits: ["update:modelValue"],
  components: { Icon, ElasticInput },
  setup: (props, { emit }) => {
    const input = ref();
    const isPicking = ref(false);

    const handleEmoji = ({ detail: { unicode } }) => {
      if (props.pickerOnly) {
        emit("update:modelValue", unicode);
      } else {
        console.log(input.value);
        const start = input.value.selectionStart;
        const end = input.value.selectionEnd;
        const value = props.modelValue ?? "";
        emit(
          "update:modelValue",
          `${value.substring(0, start)}${unicode}${value.substring(
            end,
            value.length
          )}`
        );
      }
    };
    const pickerEnter = (el, complete) => {
      el.addEventListener("emoji-click", handleEmoji);
      anime({
        targets: el,
        scaleX: [0, 1],
        scaleY: [0, 1],
        duration: 500,
        complete,
      });
    };
    return { input, isPicking, pickerEnter, log: console.log };
  },
};
</script>

<style scoped lang="scss">
emoji-picker {
  --border-size: 0.5px;
  --outline-size: 0;
  --input-border-radius: 24px;
  --input-border-color: #b5b5b5;

  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1000;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
    0 0px 0 1px rgba(10, 10, 10, 0.02);
  transform-origin: bottom right;
}
.emoji-picker-wrapper {
  position: absolute;
  right: 0;
  top: 0;

  > button {
    height: unset;
  }
}
</style>