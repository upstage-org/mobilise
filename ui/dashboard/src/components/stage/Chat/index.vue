<template>
  <transition :css="false" @enter="enter" @leave="leave">
    <div
      id="chatbox"
      v-show="chatVisibility"
      class="card is-light"
      :class="{ collapsed }"
      :style="{ opacity }"
    >
      <div class="actions">
        <Reaction v-if="collapsed" />
        <button
          class="chat-setting button is-rounded is-light"
          @click="collapsed = !collapsed"
        >
          <span class="icon">
            <Icon v-if="collapsed" src="maximize.svg" size="20" />
            <Icon v-else src="minimize.svg" size="24" class="mt-4" />
          </span>
        </button>
        <button
          class="chat-setting button is-rounded is-light"
          @click="openChatSetting"
        >
          <span class="icon">
            <Icon src="setting.svg" size="32" />
          </span>
        </button>
      </div>
      <div class="card-content" ref="theContent">
        <Messages :messages="messages" />
      </div>
      <footer class="card-footer">
        <div class="card-footer-item">
          <div v-if="!collapsed" class="is-fullwidth my-1" style="height: 30px">
            <Reaction :custom-emoji="true" />
          </div>
          <div class="control has-icons-right is-fullwidth">
            <emoji-input
              v-model="message"
              placeholder="Type message"
              :loading="loadingUser"
              @submit="sendChat"
            />
          </div>
        </div>
      </footer>
    </div>
  </transition>
</template>

<script>
import { computed, onMounted, ref, watch } from "vue";
import anime from "animejs";
import { useStore } from "vuex";
import EmojiInput from "@/components/form/EmojiInput";
import Icon from "@/components/Icon";
import Reaction from "./Reaction";
import Messages from "./Messages";

export default {
  components: { EmojiInput, Reaction, Icon, Messages },
  setup: () => {
    const theContent = ref();
    const store = useStore();
    const chatVisibility = computed(
      () => store.state.stage.settings.chatVisibility
    );

    const messages = computed(() => store.state.stage.chat.messages);
    const loadingUser = computed(() => store.state.user.loadingUser);
    const message = ref("");
    const collapsed = ref(false);
    const scrollToEnd = () => {
      anime({
        targets: theContent.value,
        scrollTop: theContent.value?.scrollHeight,
        easing: "easeInOutQuad",
      });
    };
    const sendChat = () => {
      if (message.value.trim() && !loadingUser.value) {
        store.dispatch("stage/sendChat", message.value);
        message.value = "";
        scrollToEnd();
      }
    };
    watch(messages.value, scrollToEnd);
    onMounted(scrollToEnd);

    const openChatSetting = () =>
      store.dispatch("stage/openSettingPopup", {
        type: "ChatParameters",
      });

    const opacity = computed(() => store.state.stage.chat.opacity);

    const enter = (el, complete) => {
      anime({
        targets: el,
        scale: [0, 1],
        translateY: [-200, 0],
        complete,
      });
    };
    const leave = (el, complete) => {
      anime({
        targets: el,
        scale: 0,
        translateY: -200,
        easing: "easeInOutExpo",
        complete,
      });
    };

    return {
      messages,
      message,
      sendChat,
      theContent,
      loadingUser,
      openChatSetting,
      collapsed,
      opacity,
      chatVisibility,
      enter,
      leave,
    };
  },
};
</script>

<style lang="scss" scoped>
#chatbox {
  display: flex;
  flex-direction: column;
  position: fixed;
  width: 20%;
  min-width: 250px;
  height: calc(100% - 135px);
  bottom: 16px;
  right: 16px;
  overflow: visible;
  z-index: 3;

  .card-content {
    flex-grow: 1;
    overflow-y: auto;
    padding-top: 36px;
  }
  .card-footer-item {
    flex-wrap: wrap;
    padding-top: 0;
  }

  &.collapsed {
    height: 108px;
    .card-content {
      padding-top: 20px;
      height: 0;
      > div {
        display: none;
      }
    }
    .card-footer-item {
      padding-top: 6px;
    }
  }

  .actions {
    position: absolute;
    right: 24px;
    top: 10px;
    button {
      width: 26px;
      height: 26px;
      padding: 0;
      margin-left: 6px;
    }
  }
  .control.has-icons-right .input {
    padding-right: 50px !important;
  }
}
</style>