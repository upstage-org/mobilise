<template>
  <div class="file">
    <label class="file-label">
      <input
        class="file-input"
        type="file"
        name="resume"
        :accept="accept"
        @input="handleInputFile"
      />
      <span class="file-cta">
        <span class="file-icon">
          <i class="fas fa-upload"></i>
        </span>
        <span class="file-label"> Choose a file… </span>
      </span>
      <div v-if="!valid" class="mt-2 mx-2 has-text-danger">
        <span>Maximum file size: {{ humanFileSize(mediaLimit) }}&nbsp;</span>
        <i class="fas fa-times"></i>
        (current size: {{ humanFileSize(file.size) }})
      </div>
    </label>
  </div>
  <p class="help">
    Permitted file formats are
    <span v-if="accept">{{ accept }}</span>
    <span v-else>all extensions</span>. Maximum file size
    {{ humanFileSize(mediaLimit) }}.
  </p>

  <template v-if="file">
    <img v-if="isImage" :src="modelValue" alt="Preview" />
    <div v-else class="box has-text-centered">
      <i class="fas fa-file"></i>
      <b>{{ file.name }} ({{ humanFileSize(file.size) }})</b>
    </div>
  </template>
</template>

<script>
import { ref } from "@vue/reactivity";
import { computed, watch } from "@vue/runtime-core";
import { humanFileSize } from "@/utils/common";
import { useStore } from "vuex";
export default {
  props: {
    modelValue: String,
    acceptImage: {
      type: Boolean,
      default: true,
    },
    acceptAudio: {
      type: Boolean,
      default: false,
    },
    acceptVideo: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "change"],
  setup: (props, { emit }) => {
    const store = useStore();
    const nginxLimit = computed(() => store.getters["config/uploadLimit"]);
    const mediaLimit = computed(() => {
      let limit = store.state.user.user?.uploadLimit;
      if (!limit || props.acceptVideo) {
        limit = nginxLimit.value;
      }
      return limit;
    });
    const file = ref();
    const accept = computed(() => {
      let extensions = [];
      if (props.acceptImage) {
        extensions.push(".svg,.jpg,.png,.gif");
      }
      if (props.acceptAudio) {
        extensions.push(".wav,.mpeg,.mp3,.aac,.aacp,.ogg,.webm,.flac,.m4a");
      }
      if (props.acceptVideo) {
        extensions.push(".mp4,.webm,.opgg,.3gp,.flv");
      }
      return extensions.join(",");
    });
    const valid = computed(() => {
      if (file.value) {
        return file.value.size <= mediaLimit.value;
      }
      return true;
    });

    watch(
      () => props.modelValue,
      (value) => {
        if (!value) {
          file.value = null;
        }
      }
    );

    watch(mediaLimit, () => {
      if (!valid.value) {
        emit("change", null);
      }
    });

    const handleInputFile = (e) => {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => {
        emit("update:modelValue", reader.result);
      };
      file.value = e.target.files[0];
      if (valid.value) {
        emit("change", file.value);
      } else {
        emit("change", null);
      }
    };

    const isImage = computed(() => file.value?.type?.startsWith("image"));

    return {
      handleInputFile,
      file,
      isImage,
      mediaLimit,
      humanFileSize,
      accept,
      valid,
    };
  },
};
</script>

<style>
</style>