<template>
  <div v-if="!messages.length" class="columns is-vcentered is-fullheight">
    <div class="column has-text-centered has-text-light">
      <i class="fas fa-comments fa-4x"></i>
      <p class="subtitle has-text-light">No messages yet!</p>
    </div>
  </div>
  <div v-else>
    <p v-for="item in messages" :key="item">
      <small>
        <b>{{ item.user }}: </b>
      </small>
      <span
        class="tag message"
        :style="
          'background-color: ' + item.backgroundColor + '; color: ' + item.color
        "
        :title="time(item.at)"
      >
        <Linkify>{{ item.message }}</Linkify>
      </span>
    </p>
  </div>
</template>

<script>
import moment from "moment";
import Linkify from "@/components/Linkify";
export default {
  props: ["messages"],
  components: { Linkify },
  methods: {
    time(value) {
      return moment(value).fromNow();
    },
  },
};
</script>

<style lang="scss">
.tag.message {
  white-space: break-spaces;
  height: unset;
}
</style>