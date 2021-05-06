<template>
  <section
    v-if="(model && preloading) || !model"
    class="hero is-fullheight"
    :class="{ replaying }"
  >
    <div class="hero-body">
      <div class="container">
        <template v-if="model">
          <h1 class="title" :class="{ 'mb-0': model.description }">
            {{ model.name }}
          </h1>
          <h2 v-if="model.description" class="subtittle">
            {{ model.description }}
          </h2>
          <h2 class="subtitle">
            <button class="button is-primary is-loading" />
            <span style="line-height: 2">
              <span v-if="preloadableAssets.length">
                Preloading avatars, props and backdrops...
                {{ progress }}/{{ preloadableAssets.length }}

                <div id="preloading-area">
                  <img
                    v-for="src in preloadableAssets"
                    :key="src"
                    :src="src"
                    @load="increaseProgress"
                  />
                </div>
              </span>
            </span>
          </h2>
        </template>
        <template v-else-if="preloading">
          <h2 class="subtitle">
            <button class="button is-primary is-loading" />
            <span style="line-height: 2">Loading stage information...</span>
          </h2>
        </template>
        <template v-else>
          <h1 class="title">Stage not found!</h1>
          <span>Are you sure the stage url is correct 🤔?</span>
        </template>
      </div>
    </div>
  </section>
</template>

<script>
import { computed, inject, ref } from "vue";
import { useStore } from "vuex";
export default {
  setup: () => {
    const store = useStore();
    const preloading = computed(() => store.state.stage.preloading);
    const preloadableAssets = computed(
      () => store.getters["stage/preloadableAssets"]
    );
    const model = computed(() => store.state.stage.model);
    const progress = ref(0);
    const stopLoading = () =>
      store.commit("stage/SET_PRELOADING_STATUS", false);
    const increaseProgress = () => {
      progress.value++;
      if (progress.value === preloadableAssets.value.length) {
        stopLoading();
      }
    };

    setTimeout(stopLoading, 60000);
    const replaying = inject("replaying");

    return {
      model,
      preloadableAssets,
      progress,
      increaseProgress,
      preloading,
      replaying,
    };
  },
};
</script>

<style scoped lang="scss">
#preloading-area {
  width: 0px;
  height: 0px;
  overflow: hidden;
}
section {
  background-color: #30ac45;
  * {
    color: white;
    background-color: transparent !important;
  }
  &.replaying {
    background-color: #363636;
  }
}
</style>