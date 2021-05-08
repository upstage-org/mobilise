<template>
  <div class="avatar-topping">
    <span
      v-if="holder && isPlayer"
      class="icon marker"
      :class="{ inactive: !isHolding }"
      :data-tooltip="`${object.name ? object.name + ' held by' : 'Held by'} ${
        holder.nickname
      }`"
      @click="openChatBox"
    >
      <Icon src="my-avatar.svg" />
    </span>
    <transition @enter="enter" @leave="leave" :css="false" appear>
      <div
        v-if="object.speak"
        class="chat-bubble"
        tabindex="-1"
        :key="object.speak"
        :style="{
          width: object.w + 'px',
          'max-width': 'max-content',
        }"
      >
        <div class="py-2 px-4">
          <Linkify>{{ object.speak.message }}</Linkify>
        </div>
        <i class="fas fa-caret-down"></i>
      </div>
    </transition>
  </div>
</template>

<script>
import { computed, inject } from "vue";
import { useStore } from "vuex";
import anime from "animejs";
import Icon from "@/components/Icon";
import Linkify from "@/components/Linkify";
export default {
  props: ["object", "active"],
  components: { Icon, Linkify },
  setup: (props) => {
    const store = useStore();
    const holder = inject("holder");
    const isHolding = computed(
      () => props.object.id === store.state.user.avatarId
    );
    const isPlayer = computed(() => store.getters["auth/loggedIn"]);

    const enter = (el, complete) => {
      anime({
        targets: el,
        scale: [0, 1],
        rotate: [180, 0],
        translateY: [0, "-100%"],
        translateX: [0, "-50%"],
        complete,
      });
    };

    const leave = (el, complete) => {
      anime({
        targets: el,
        scale: [1, 0],
        rotate: [0, 180],
        complete,
      });
    };

    const openChatBox = () => {
      store.dispatch("stage/openSettingPopup", {
        type: "ChatBox",
        simple: true,
      });
    };

    return {
      enter,
      leave,
      holder,
      isHolding,
      isPlayer,
      openChatBox,
    };
  },
};
</script>

<style scoped lang="scss">
.avatar-topping {
  position: absolute;
  top: -36px;
  left: 50%;
}
.chat-bubble {
  position: absolute;
  border-radius: 4px;
  text-align: center;
  line-height: 1em;
  background: white;
  word-break: break-word;
  box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
    0 0px 0 1px rgba(10, 10, 10, 0.02);
  i.fas {
    position: absolute;
    left: calc(50% - 4px);
    bottom: -8px;
    color: white;
  }
}
.marker {
  position: absolute;
  left: -12px;
}
.inactive {
  filter: grayscale(1);
}
</style>