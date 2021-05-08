<template>
  <Object :object="object">
    <template #menu="slotProps">
      <MenuContent
        :object="object"
        :closeMenu="slotProps.closeMenu"
        v-model:active="active"
      />
    </template>
    <template #render>
      <canvas ref="el"></canvas>
    </template>
  </Object>
</template>

<script>
import Object from "./Object.vue";
import MenuContent from "./Avatar/ContextMenu"; // Drawing should inherit all of avatar behavior
import { useStore } from "vuex";
import { useDrawing } from "@/components/stage/Toolbox/tools/Draw/composable";
import { computed, provide } from "@vue/runtime-core";

export default {
  props: ["object"],
  components: { Object, MenuContent },
  setup: (props) => {
    const store = useStore();
    const holder = computed(() =>
      store.state.stage.sessions.find((s) => s.avatarId === props.object.id)
    );
    provide("holder", holder);

    const { el } = useDrawing(props.object);

    return { el, store };
  },
};
</script>

<style>
</style>