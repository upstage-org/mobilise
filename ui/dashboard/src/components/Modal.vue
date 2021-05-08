<template>
  <span @click="openModal">
    <slot name="trigger" />
  </span>
  <teleport to="body">
    <div v-if="isActive" class="modal is-active">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-card" :style="{ width }">
        <header v-if="$slots.header" class="modal-card-head">
          <p class="modal-card-title"><slot name="header" /></p>
          <button
            class="delete"
            aria-label="close"
            @click="closeModal"
          ></button>
        </header>
        <section v-if="$slots.content" class="modal-card-body">
          <slot name="content" />
        </section>
        <footer v-if="$slots.footer" class="modal-card-foot">
          <slot name="footer" :close-modal="closeModal" />
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, watchEffect } from "vue";
export default {
  props: {
    modelValue: Boolean,
    width: {
      type: String,
      default: "80%",
    },
  },
  emits: ["update:modelValue"],
  setup: (props, { emit }) => {
    const isActive = ref(props.modelValue);
    watchEffect(() => (isActive.value = props.modelValue));

    const setVisible = (visible) => {
      isActive.value = visible;
      emit("update:modelValue", visible);
    };
    const openModal = () => setVisible(true);
    const closeModal = () => setVisible(false);

    return { isActive, openModal, closeModal };
  },
};
</script>

<style>
.modal {
  z-index: 4000 !important;
}
</style>