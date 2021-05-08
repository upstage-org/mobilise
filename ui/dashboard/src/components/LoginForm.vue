<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">Enter username and password to login</p>
    </header>
    <div class="card-content">
      <div class="content">
        <div class="field">
          <p class="control has-icons-left">
            <input
              class="input"
              v-model="username"
              placeholder="Username"
              required
            />
            <span class="icon is-small is-left">
              <i class="fas fa-user"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control has-icons-left has-icons-right">
            <input
              class="input"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              v-model="password"
              required
            />
            <span class="icon is-small is-left">
              <i class="fas fa-lock"></i>
            </span>
            <a
              class="icon is-small is-right"
              style="pointer-events: all"
              @click="toggleShowPassword"
            >
              <i :class="`fas fa-${showPassword ? 'eye-slash' : 'eye'}`"></i>
            </a>
          </p>
          <p>By logging in, you are agreeing to our <TermsOfService /></p>
        </div>
      </div>
    </div>
    <footer class="card-footer">
      <a
        class="card-footer-item is-white button has-text-primary"
        :class="{ 'is-loading': loading }"
        @click="submit"
      >
        <span>Login</span>
        <span class="icon is-medium">
          <i class="fas fa-chevron-right"></i>
        </span>
      </a>
    </footer>
  </div>
</template>

<script>
import TermsOfService from "@/components/TermsOfService.vue";

export default {
  emits: ["success"],
  components: { TermsOfService },
  data() {
    return {
      showPassword: false,
      username: "",
      password: "",
      loading: false,
    };
  },
  methods: {
    toggleShowPassword() {
      this.showPassword = !this.showPassword;
    },
    submit() {
      const user = {
        username: this.username,
        password: this.password,
      };
      this.loading = true;
      this.$store
        .dispatch("auth/login", user)
        .then(() => {
          this.$emit("success");
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style>
</style>
