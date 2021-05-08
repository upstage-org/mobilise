<template>
  <div class="card-header">
    <span class="card-header-title">Voice Setting</span>
  </div>
  <div class="card-content voice-parameters">
    <HorizontalField title="Voice">
      <Dropdown
        v-model="parameters.voice"
        :data="voices"
        :render-label="(voice) => `${voice.name} (${voice.lang})`"
        :render-value="(voice) => voice.voiceURI"
        style="width: 100%"
      />
    </HorizontalField>

    <HorizontalField title="Pitch">
      <input
        class="slider is-fullwidth is-primary m-0"
        v-model="parameters.pitch"
        type="range"
        min="0"
        max="1"
        step="0.05"
      />
    </HorizontalField>
    <HorizontalField title="Rate">
      <input
        class="slider is-fullwidth is-primary m-0"
        v-model="parameters.rate"
        type="range"
        min="-3"
        max="3"
        step="0.25"
      />
    </HorizontalField>

    <HorizontalField title="Volume">
      <input
        class="slider is-fullwidth is-primary m-0"
        v-model="parameters.volume"
        type="range"
        min="0"
        max="1"
        step="0.05"
      />
    </HorizontalField>

    <HorizontalField title="Test voice">
      <InputButtonPostfix
        v-model="test"
        @ok="testVoice"
        icon="fas fa-volume-up"
      />
    </HorizontalField>

    <SaveButton @click="save" />
  </div>
</template>

<script>
import { computed, reactive, ref } from "vue";
import SaveButton from "@/components/form/SaveButton";
import Dropdown from "@/components/form/Dropdown";
import HorizontalField from "@/components/form/HorizontalField";
import InputButtonPostfix from "@/components/form/InputButtonPostfix";
import { useStore } from "vuex";
import { avatarSpeak } from "@/services/speech";

export default {
  components: { SaveButton, Dropdown, HorizontalField, InputButtonPostfix },
  setup: (props, { emit }) => {
    const store = useStore();
    const currentAvatar = computed(() => store.getters["stage/currentAvatar"]);
    const voices = window.speechSynthesis.getVoices();
    const parameters = reactive(
      currentAvatar.value?.voice ?? {
        voice: (voices.find((v) => v.default) ?? voices[0]).voiceURI,
        pitch: 0.5,
        rate: 0,
        volume: 1,
      }
    );
    const test = ref("Welcome to UpStage!");
    const testVoice = () => {
      avatarSpeak({ voice: parameters }, test.value);
    };

    const save = () => {
      store
        .dispatch("stage/shapeObject", {
          ...currentAvatar.value,
          voice: parameters,
        })
        .then(() => emit("close"));
    };

    return { save, parameters, voices, test, testVoice };
  },
};
</script>

<style lang="scss">
.card-footer-item {
  cursor: pointer;
}
.voice-parameters {
  .dropdown,
  .dropdown-trigger,
  .dropdown-trigger > button,
  .dropdown-menu {
    width: 100%;
  }
}
</style>