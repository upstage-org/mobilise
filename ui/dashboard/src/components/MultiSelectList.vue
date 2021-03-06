<template>
  <div class="columns">
    <div class="column">
      <div class="box">
        <p v-if="titles" class="title is-5">{{ titles[0] }}</p>
        <Skeleton v-if="loading" />
        <div v-else class="columns is-multiline">
          <div
            class="column item"
            v-for="item in data"
            :key="item"
            :class="columnClass(item)"
          >
            <Selectable
              multiple
              :selected="modelValue.includes(item)"
              @select="select(item)"
            >
              <slot name="render" :item="item">
                {{ item.name }}
              </slot>
            </Selectable>
          </div>
        </div>
      </div>
    </div>
    <div class="column is-narrow">
      <button class="button is-primary" @click="selectAll">
        <i class="fas fa-angle-double-right"></i>
      </button>
      <br />
      <br />
      <button class="button is-primary" @click="removeAll">
        <i class="fas fa-angle-double-left"></i>
      </button>
    </div>
    <div class="column">
      <div class="box">
        <p v-if="titles" class="title is-5">{{ titles[1] }}</p>
        <Skeleton v-if="loading" />
        <div v-else class="columns is-multiline">
          <template v-for="item in modelValue" :key="item">
            <div
              v-if="data.includes(item)"
              class="column item"
              @click="remove(item)"
              :class="columnClass(item)"
            >
              <Selectable revert @select="remove(item)">
                <slot name="render" :item="item">
                  {{ item.name }}
                </slot>
              </Selectable>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Skeleton from "@/components/Skeleton";
import Selectable from "@/components/Selectable";

export default {
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
    data: Array,
    titles: Array,
    loading: Boolean,
    columnClass: {
      type: Function,
      default: () => "",
    },
  },
  emits: ["update:modelValue"],
  components: { Skeleton, Selectable },
  setup: (props, { emit }) => {
    const remove = (item) => {
      emit(
        "update:modelValue",
        props.modelValue.filter((value) => value !== item)
      );
    };

    const select = (item) => {
      if (props.modelValue.includes(item)) {
        remove(item);
      } else {
        emit("update:modelValue", props.modelValue.concat(item));
      }
    };

    const selectAll = () => {
      emit("update:modelValue", props.data);
    };

    const removeAll = () => {
      emit(
        "update:modelValue",
        props.modelValue.filter((item) => !props.data.includes(item))
      );
    };

    return { select, remove, selectAll, removeAll };
  },
};
</script>

<style lang="scss" scoped>
.item {
  height: fit-content;
}
</style>