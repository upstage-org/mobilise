<template>
  <UserTable action-column="Delete">
    <template #action="{ item, displayName, refresh }">
      <Confirm
        @confirm="(close) => deleteUser({ item, displayName, close, refresh })"
        :loading="loading"
      >
        <template #trigger>
          <i class="fas fa-times has-text-danger clickable"></i>
        </template>
        <div class="has-text-centered">
          Deleting user
          <span class="has-text-danger">
            {{ displayName }}
          </span>
          will also delete all of {{ displayName }}'s stages. This cannot be
          undo!
          <br />
          <strong>Are you sure you want to continue?</strong>
        </div>
      </Confirm>
    </template>
  </UserTable>
</template>

<script>
import UserTable from "./UserTable";
import { useMutation } from "@/services/graphql/composable";
import { userGraph } from "@/services/graphql";
import Confirm from "@/components/Confirm";

export default {
  components: { UserTable, Confirm },
  setup: () => {
    const { save, loading } = useMutation(userGraph.deleteUser);
    const deleteUser = async ({ item, displayName, close, refresh }) => {
      await save(`User ${displayName} deleted successfully!`, item);
      refresh();
      close();
    };
    return { loading, deleteUser };
  },
};
</script>

<style>
</style>