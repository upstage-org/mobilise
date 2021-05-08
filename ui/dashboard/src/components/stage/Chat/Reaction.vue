<template>
  <button
    class="button is-small is-rounded reaction mx-1"
    v-for="react in reactions"
    :key="react"
    @click="sendReaction(react)"
  >
    {{ react }}
  </button>
  <span v-if="customEmoji">
    <emoji-input
      :picker-only="true"
      :style="{ height: '30px' }"
      className="is-white"
      @update:model-value="sendCustomReaction"
    >
      <template #icon>
        <span class="icon">
          <Icon src="new.svg" />
        </span>
      </template>
    </emoji-input>
  </span>
  <teleport to="body">
    <div class="flying-reactions">
      <transition-group :css="false" @enter="flyin" @leave="flyout">
        <div
          v-for="react in flyingReactions"
          :key="react"
          :style="{
            position: 'fixed',
            left: react.x + 'px',
            top: react.y + 'px',
            fontSize: '42px',
          }"
        >
          {{ react.reaction }}
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import anime from "animejs";
import EmojiInput from "@/components/form/EmojiInput";
import Icon from "@/components/Icon";

export default {
  components: { EmojiInput, Icon },
  props: ["customEmoji"],
  setup: () => {
    const store = useStore();

    const reactions = ["❤️", "🤣", "🙌", "👏"];
    const sendReaction = (react) => {
      store.dispatch("stage/sendReaction", react);
    };

    const flyingReactions = computed(() => store.state.stage.reactions);

    const flyin = (el) => {
      anime({
        targets: el,
        translateY: [100, 0],
        scale: [1, 1.5, 1],
      });
    };
    const flyout = (el, complete) => {
      anime({
        targets: el,
        scale: 0,
        rotate: 180,
        translateY: 100,
        duration: 2000,
        complete,
      });
    };

    const sendCustomReaction = (e) => {
      sendReaction(e);
    };

    return {
      reactions,
      sendReaction,
      flyingReactions,
      flyin,
      flyout,
      sendCustomReaction,
    };
  },
};
</script>

<style lang="scss" scoped>
.flying-reactions {
  position: fixed;
}
.button.is-rounded {
  width: 16px;
}
</style>