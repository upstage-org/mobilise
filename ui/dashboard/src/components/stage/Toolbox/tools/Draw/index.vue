<template>
  <canvas
    ref="el"
    v-show="isDrawing"
    class="drawing"
    :width="stageSize.width"
    :height="stageSize.height"
    :style="{
      cursor,
      top: stageSize.top + 'px',
      left: stageSize.left + 'px',
      'background-color': `rgba(255, 255, 255, ${liveDrawing ? '0.5' : '0.8'})`,
    }"
  >
    Your browser does not support the HTML5 canvas tag.
  </canvas>
  <template v-if="isDrawing">
    <div class="drawing-tool">
      <div class="icon is-large">
        <Switch v-model="liveDrawing" class="is-success is-rounded ml-2" />
      </div>
      <span class="tag is-light is-block">Live drawing</span>
    </div>
    <div class="drawing-tool">
      <div class="icon is-large">
        <ColorPicker v-model="color" />
      </div>
      <span class="tag is-light is-block">Color</span>
    </div>
    <div class="drawing-tool" style="width: 200px">
      <div class="size-preview">
        <div
          class="dot"
          :style="{
            width: size + 'px',
            height: size + 'px',
            'background-color': color,
          }"
          @click="mode = 'draw'"
        />
      </div>
      <input
        class="slider is-fullwidth m-0 is-dark"
        step="1"
        min="1"
        max="50"
        type="range"
        v-model="size"
      />
    </div>
    <div
      class="drawing-tool"
      @click="toggleErase"
      :class="{
        active: mode === 'erase',
      }"
    >
      <div class="icon is-large">
        <Icon size="36" src="erase.svg" />
      </div>
      <span class="tag is-light is-block">Erase</span>
    </div>
    <div class="drawing-tool" @click="undo">
      <div class="icon is-large">
        <Icon size="36" src="undo.svg" />
      </div>
      <span class="tag is-light is-block">Undo</span>
    </div>
    <div class="drawing-tool" @click="clearCanvas(true)">
      <div class="icon is-large">
        <Icon size="36" src="clear.svg" />
      </div>
      <span class="tag is-light is-block">Clear</span>
    </div>
    <div class="drawing-tool" @click="save(true)">
      <div class="icon is-large">
        <Icon size="36" src="check.svg" />
      </div>
      <span class="tag is-light is-block">Save</span>
    </div>
    <div class="drawing-tool" @click="cancel">
      <div class="icon is-large">
        <Icon size="36" src="cancel.svg" />
      </div>
      <span class="tag is-light is-block">Cancel</span>
    </div>
  </template>
  <template v-else>
    <div @click="create" class="is-pulled-left">
      <div class="icon is-large">
        <Icon src="new.svg" size="36" />
      </div>
      <span class="tag is-light is-block">New</span>
    </div>
    <div v-for="drawing in drawings" :key="drawing">
      <SavedDrawing :drawing="drawing" />
    </div>
  </template>
</template>

<script>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useDrawable } from "./composable";
import ColorPicker from "@/components/form/ColorPicker";
import Icon from "@/components/Icon";
import Switch from "@/components/form/Switch";
import SavedDrawing from "./SavedDrawing";

export default {
  components: { SavedDrawing, ColorPicker, Icon, Switch },
  setup: () => {
    const store = useStore();
    const stageSize = computed(() => store.getters["stage/stageSize"]);
    const drawings = computed(() => store.state.stage.board.drawings);
    const isDrawing = computed(() => {
      return store.state.stage.preferences.isDrawing;
    });
    const currentDrawing = ref();
    const {
      el,
      cursor,
      getDrawedArea,
      clearCanvas,
      undo,
      toggleErase,
      color,
      size,
      mode,
      history,
    } = useDrawable();
    const create = () => {
      store.commit("stage/UPDATE_IS_DRAWING", true);
    };
    const cancel = () => {
      store.commit("stage/UPDATE_IS_DRAWING", false);
      currentDrawing.value = null;
    };
    const save = (closeAfterSaving) => {
      if (!currentDrawing.value) {
        const area = getDrawedArea();
        if (area) {
          store
            .dispatch("stage/addDrawing", { ...area, commands: history })
            .then((drawing) => {
              currentDrawing.value = drawing;
            });
        }
      }
      if (closeAfterSaving) {
        cancel();
      }
    };

    const liveDrawing = ref(false);
    watch(history, (value) => {
      if (liveDrawing.value) {
        if (currentDrawing.value) {
          store.dispatch("stage/shapeObject", {
            ...currentDrawing.value,
            ...getDrawedArea(),
            commands: value,
          });
        } else {
          save();
        }
      }
    });

    return {
      isDrawing,
      drawings,
      color,
      size,
      create,
      save,
      cancel,
      el,
      clearCanvas,
      undo,
      toggleErase,
      mode,
      cursor,
      stageSize,
      liveDrawing,
    };
  },
};
</script>

<style lang="scss" scoped>
.drawing {
  position: fixed;
  z-index: 1000;
}
.drawing-tool {
  z-index: 1001;
  position: relative;
  vertical-align: top;
}
.size-preview {
  display: flex;
  width: 100%;
  height: 48px;
}
.dot {
  margin: auto;
  background-color: black;
  border-radius: 100%;
}
</style>