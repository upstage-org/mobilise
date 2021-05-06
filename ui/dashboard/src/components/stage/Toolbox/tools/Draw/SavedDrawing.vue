<template>
  <Skeleton :data="drawing">
    <canvas ref="el" />
  </Skeleton>
</template>

<script>
import Skeleton from "@/components/objects/Skeleton";
import { useDrawing } from "./composable";
export default {
  components: { Skeleton },
  props: ["drawing"],
  setup: (props) => {
    const { el } = useDrawing({ ...props.drawing, w: 88, h: 88 });
    return { el };
  },
};
</script>

<style>
</style>