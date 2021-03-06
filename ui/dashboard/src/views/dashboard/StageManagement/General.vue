<template>
  <div>
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Stage Name</label>
      </div>
      <div class="field-body">
        <Field
          placeholder="Full Name"
          v-model="form.name"
          required
          requiredMessage="Stage name is required"
          expanded
        />
        <Field
          required
          placeholder="Short Name"
          v-model="form.fileLocation"
          requiredMessage="Short name is required"
          expanded
          @keyup="shortNameValid = null"
          @input="checkShortName"
          :right="
            validatingShortName
              ? 'fas fa-circle-notch fa-spin'
              : shortNameValid === true
              ? 'fas fa-check'
              : shortNameValid === false
              ? 'fas fa-times'
              : 'fas'
          "
          :help="!form.fileLocation && `From which the stage URL is created`"
          :error="!shortNameValid && 'This short name already existed!'"
        />
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Description</label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <textarea
              class="textarea"
              placeholder="enter a description (previously only for the splash screen that displays while loading - do we need 2 description fields now, one for the foyer display & one for the splash screen?)"
              v-model="form.description"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Users</label>
      </div>
      <div class="field-body">
        <div class="field is-narrow">
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="form.ownerId">
                <option v-for="user in users" :key="user" :value="user.id">
                  {{ displayName(user) }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="field is-horizontal" v-if="stage">
      <div class="field-label">
        <label class="label">Stage Status</label>
      </div>
      <div class="field-body">
        <div class="field is-narrow">
          <div class="control">
            <label class="radio">
              <input type="radio" v-model="form.status" value="live" />
              Live
            </label>
            <label class="radio">
              <input type="radio" v-model="form.status" value="upcoming" />
              Upcoming
            </label>
            <label class="radio">
              <input type="radio" v-model="form.status" value="rehearsal" />
              Rehearsal
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="field is-horizontal">
      <div class="field-label">
        <!-- Left empty for spacing -->
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <template v-if="stage">
              <button
                class="button mr-2 mt-2 is-primary"
                :class="{ 'is-loading': loading }"
                @click="updateStage"
                :disabled="!shortNameValid"
              >
                Save Stage
              </button>
              <button class="button mr-2 mt-2 is-warning">Clear Chat</button>
              <button class="button mr-2 mt-2 is-warning">Sweep Stage</button>
              <button class="button mr-2 mt-2 is-dark">
                Hide From Stage List
              </button>
              <button class="button mr-2 mt-2 is-danger">Delete Stage</button>
            </template>
            <template v-else>
              <button
                class="button mr-2 mt-2 is-primary"
                :class="{ 'is-loading': loading }"
                @click="createStage"
                :disabled="!shortNameValid"
              >
                Create Stage
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  useMutation,
  useQuery,
  useRequest,
} from "@/services/graphql/composable";
import { stageGraph, userGraph } from "@/services/graphql";
import { inject, reactive, ref } from "vue";
import Field from "@/components/form/Field";
import { notification } from "@/utils/notification";
import { useRouter } from "vue-router";
import { displayName } from "@/utils/auth";
import { debounce } from "@/utils/common";

export default {
  components: { Field },
  setup: () => {
    const router = useRouter();
    const stage = inject("stage");

    const form = reactive({
      ...stage.value,
      ownerId: stage.value.owner?.id,
      status: stage.value.attributes?.find((a) => a.name === "status")
        ?.description,
    });

    const { nodes: users } = useQuery(userGraph.userList);
    const { loading, mutation, data } = useMutation(
      stage.value.id ? stageGraph.updateStage : stageGraph.createStage,
      form
    );
    const createStage = async () => {
      try {
        await mutation();
        notification.success(
          "Stage created successfully! ID: " + data.value.createStage.stage.id
        );
        router.push(
          `/dashboard/stage-management/${data.value.createStage.stage.id}/`
        );
      } catch (error) {
        notification.error(error);
      }
    };
    const updateStage = async () => {
      try {
        await mutation();
        notification.success("Stage updated successfully!");
      } catch (error) {
        notification.error(error);
      }
    };

    const shortNameValid = ref(!!stage.value.id);
    const { loading: validatingShortName, fetch } = useRequest(
      stageGraph.stageList
    );
    const checkShortName = debounce(async () => {
      const response = await fetch({
        fileLocation: form.fileLocation,
      });
      shortNameValid.value = true;
      if (response.stageList.edges.length) {
        const existingStage = response.stageList.edges[0].node;
        if (existingStage.fileLocation !== stage.value.fileLocation) {
          shortNameValid.value = false;
        }
      }
    }, 500);

    return {
      form,
      stage,
      createStage,
      updateStage,
      loading,
      users,
      displayName,
      checkShortName,
      validatingShortName,
      shortNameValid,
    };
  },
};
</script>

<style>
</style>