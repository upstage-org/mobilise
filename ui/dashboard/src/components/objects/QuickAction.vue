<template>
  <div
    class="quick-action"
    v-show="active"
    @mousedown.stop="keepActive"
    @mouseup.stop="keepActive"
  >
    <button
      class="button is-rounded is-small"
      :class="{ 'is-primary': object.liveAction }"
      @click="toggleLiveAction"
    >
      <i class="fas fa-lightbulb"></i>
    </button>
    <button class="button is-rounded is-small" @click="deleteObject">
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script>
import { computed, inject } from "vue";
import { useStore } from "vuex";
export default {
  props: ["object", "active"],
  emits: ["update:active"],
  setup: (props, { emit }) => {
    const store = useStore();
    const holder = inject("holder");
    const isHolding = computed(
      () => props.object.id === store.state.user.avatarId
    );
    const isPlayer = computed(() => store.getters["auth/loggedIn"]);

    const keepActive = () => {
      emit("update:active", true);
    };

    const toggleLiveAction = () => {
      store.dispatch("stage/shapeObject", {
        ...props.object,
        liveAction: !props.object.liveAction,
      });
    };

    const deleteObject = () => {
      store.dispatch("stage/deleteObject", props.object);
    };

    return {
      deleteObject,
      keepActive,
      toggleLiveAction,
      holder,
      isHolding,
      isPlayer,
    };
  },
};
</script>

<style scoped lang="scss">
.quick-action {
  position: absolute;
  width: min-content;
  right: -40px;
  button {
    width: 16px;
    margin-bottom: 4px;
  }
}
</style>