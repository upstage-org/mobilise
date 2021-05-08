<template>
  <span v-html="html"></span>
</template>

<script>
import { linkify } from "@/utils/common";

export default {
  setup: (props, { slots }) => {
    const content = slots
      .default()
      .map((slot) => slot.children)
      .join();
    const html = linkify(content);
    return { html };
  },
};
</script>

<style>
</style>