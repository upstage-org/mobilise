<template>
  <div class="control has-icons-right is-fullwidth">
    <input
      ref="el"
      class="input is-rounded"
      :value="modelValue"
      @input="(e) => $emit('update:modelValue', e.target.value)"
      @keyup.enter="(e) => $emit('ok', e.target.value)"
      v-bind="$attrs"
    />
    <button
      class="icon is-right clickable button is-primary is-rounded"
      :class="{ 'is-loading': loading }"
      :disabled="loading"
      @click="$emit('ok', el.value)"
    >
      <slot name="icon">
        <i :class="icon"></i>
      </slot>
    </button>
  </div>
</template>

<script>
import { ref } from "vue";
export default {
  props: ["icon", "loading", "modelValue"],
  emits: ["update:modelValue", "ok"],
  setup: () => {
    const el = ref();
    return { el };
  },
};
</script>

<style scoped>
input.is-rounded {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>