<template>
  <button class="button mr-2 mt-2 is-warning" @click="sweep">
    <template v-if="status">
      <button class="button is-warning is-loading"></button>
      <span>{{ status }}</span>
    </template>
    <span v-else> Clear Chat & Sweep Stage</span>
  </button>
</template>

<script>
import { inject, ref } from "@vue/runtime-core";
import { useMutation } from "@/services/graphql/composable";
import { stageGraph } from "@/services/graphql";
import { notification } from "@/utils/notification";
import mqttService from "@/services/mqtt";
import { TOPICS } from "@/utils/constants";
import { namespaceTopic } from "@/store/modules/stage/reusable";
export default {
  setup: () => {
    const stage = inject("stage");
    const status = ref();
    const { mutation } = useMutation(stageGraph.sweepStage, {
      id: stage.value.id,
    });
    const sweep = async () => {
      try {
        status.value = "Sweeping...";
        await mutation();
        status.value = "Clearing broker retained messages...";
        await new Promise((resolve) => {
          mqttService.connect().on("connect", () => {
            const promisese = Object.keys(TOPICS)
              .map((key) =>
                namespaceTopic(TOPICS[key], stage.value.fileLocation)
              )
              .map((topic) => mqttService.sendMessage(topic, undefined, true));
            console.log(promisese);
            Promise.all(promisese).then(resolve);
          });
        });
        notification.success(`${stage.value.name} swept successfully!`);
      } catch (error) {
        notification.warning(error);
      } finally {
        status.value = "";
      }
    };

    return { status, sweep };
  },
};
</script>

<style>
</style>