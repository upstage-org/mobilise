<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <Logo link="https://www.upstage.org.nz" />
      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        @click="toggleExpanded"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div :class="{ 'navbar-menu': true, 'is-active': expanded }">
      <div class="navbar-start">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link is-arrowless"> About </a>
          <div class="navbar-dropdown">
            <a class="navbar-item" href="#"> FAQs </a>
            <a class="navbar-item" href="#"> Contacts </a>
            <a class="navbar-item" href="#"> Diversity + Inclusion </a>
          </div>
        </div>
        <div class="vertical-divider" />
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link is-arrowless"> &nbsp; Learn &nbsp; </a>
          <div class="navbar-dropdown">
            <a class="navbar-item" href="#"> Research </a>
            <a
              class="navbar-item"
              href="https://github.com/upstage-org/documentation"
              target="_blank"
            >
              Documentation
            </a>
          </div>
        </div>
        <div class="vertical-divider" />
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link is-arrowless"> Festivals </a>
          <div class="navbar-dropdown">
            <a class="navbar-item" href="#"> 10th Birthday </a>
            <a class="navbar-item" href="#"> 121212 </a>
          </div>
        </div>
        <div class="vertical-divider" />
        <a
          class="navbar-item"
          href="https://github.com/upstage-org/mobilise/"
          target="_blank"
        >
          Develop
        </a>
        <div class="vertical-divider" />
        <a class="navbar-item" to="/#">Donate</a>
        <div class="vertical-divider" />
        <router-link class="navbar-item" to="/live/demo">Stage</router-link>
      </div>

      <div class="navbar-end">
        <template v-if="loggedIn">
          <router-link to="/dashboard" class="button is-primary m-2">
            <strong>Dashboard</strong>
          </router-link>
          <button @click="logout" class="button m-2 mr-6">
            <strong>Logout</strong>
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="button is-primary m-2">
            <strong>Login</strong>
          </router-link>
          <router-link to="/register" class="button is-primary m-2 mr-6">
            <strong>Register</strong>
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref } from "vue";
import { loggedIn, logout } from "@/utils/auth";
import Logo from "./Logo";

export default {
  components: { Logo },
  setup() {
    const expanded = ref(false);
    const toggleExpanded = () => (expanded.value = !expanded.value);
    return { expanded, toggleExpanded, loggedIn, logout };
  },
};
</script>

<style lang="scss">
@media screen and (max-width: 1023px) {
  .navbar-menu {
    position: absolute;
    width: 100%;
  }
  .navbar-end a {
    margin-left: auto;
  }
}
</style>