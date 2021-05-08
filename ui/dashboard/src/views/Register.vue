<template>
  <div class="columns is-mobile is-centered is-vcentered foyer-background">
    <div
      class="column is-three-quarters-mobile is-two-thirds-tablet is-half-desktop is-one-third-widescreen"
    >
      <form @submit.prevent="submit">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">Create a account with UpStage</p>
          </header>
          <div class="card-content">
            <div class="content">
              <Field
                v-model="form.username"
                left="fas fa-user"
                placeholder="Username"
                required
                requiredMessage="Username is required"
                :touched="touched"
              />
              <Password
                v-model="form.password"
                left="fas fa-lock"
                placeholder="Password"
                required
                requiredMessage="Password is required"
                :touched="touched"
              />
              <Password
                v-model="form.confirmPassword"
                left="fas fa-lock"
                placeholder="Confirm Password"
                :error="confirmPasswordError"
              />
              <div class="columns">
                <div class="column pr-0 pb-0">
                  <Field
                    v-model="form.firstName"
                    left="fas fa-user"
                    placeholder="First Name"
                  />
                </div>
                <div class="column pb-0">
                  <Field v-model="form.lastName" placeholder="Last Name" />
                </div>
              </div>
              <Field
                v-model="form.email"
                left="fas fa-envelope"
                placeholder="Email"
                type="email"
                required
                requiredMessage="Email is required"
                :touched="touched"
              />
              <label class="checkbox">
                <input type="checkbox" v-model="agreed" />
                I agree to the <TermsOfService />.
              </label>
            </div>
          </div>
          <footer class="card-footer">
            <button
              class="card-footer-item is-white button has-text-primary"
              :class="{ 'is-loading': loading }"
              type="submit"
            >
              <span>Register</span>
              <span class="icon is-medium">
                <i class="fas fa-check"></i>
              </span>
            </button>
          </footer>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Field from "@/components/form/Field.vue";
import Password from "@/components/form/Password.vue";
import TermsOfService from "@/components/TermsOfService.vue";
import { computed, reactive, ref } from "vue";
import { useMutation } from "@/services/graphql/composable";
import { userGraph } from "@/services/graphql";
import { useRouter } from "vue-router";
import { notification } from "@/utils/notification";

export default {
  components: { Field, Password, TermsOfService },
  setup: () => {
    const router = useRouter();
    const form = reactive({});
    const { mutation, loading } = useMutation(userGraph.createUser, form);
    const confirmPasswordError = computed(() =>
      form.password !== form.confirmPassword
        ? "Confirm password mismatch"
        : false
    );
    const touched = ref(false);
    const agreed = ref(false);

    const submit = async () => {
      touched.value = true;
      if (!form.username || !form.password || !form.email) return;
      if (confirmPasswordError.value) return;
      if (!agreed.value) {
        notification.error("Please aggree to the Terms of Service!");
        return;
      }
      try {
        const response = await mutation();
        notification.success(
          "Username " +
            response.createUser.user.username +
            " created successfully!"
        );
        router.push("/login");
      } catch (error) {
        if (error.includes("upstage_user_username_key")) {
          notification.error("Username " + form.username + " already exists!");
        } else if (error.includes("upstage_user_email_key")) {
          if (form.email) {
            notification.error("Email " + form.email + " already exists!");
          } else {
            notification.error("Email is required!");
          }
        } else {
          notification.error(error);
        }
      }
    };

    return {
      form,
      loading,
      submit,
      confirmPasswordError,
      touched,
      agreed,
    };
  },
};
</script>

<style>
.clickable {
  pointer-events: all;
}
</style>