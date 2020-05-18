<template>
  <div>
    <b-navbar id="navbar" toggleable="lg" type="dark" variant="info">
      <b-navbar-brand tag="h1" class="mb-0 ml-auto">Lit2Hybrid</b-navbar-brand>
      <b-nav-text>a tool for multiplex literature mining.</b-nav-text>
    </b-navbar>

    <b-form class="row ml-3 mr-3" inline>
      <label for="inline-form-input-terms">Terms:</label>
      <b-form-textarea
        v-model="terms"
        id="textarea-small"
        class="mb-2 mr-sm-5 mb-sm-0"
        rows="5"
        placeholder="Enter your search terms."
      ></b-form-textarea>

      <label for="inline-form-input-modifiers">Modifiers:</label>
      <b-form-textarea
        v-model="modifiers"
        id="textarea-small"
        class="mb-2 mr-sm-5 mb-sm-0"
        rows="5"
        placeholder="Enter modifiers."
        autocomplete="true"
      ></b-form-textarea>
      <b-button variant="primary" @click="checkForm">Search</b-button>
    </b-form>
    <div v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
      </ul>
    </div>
    <div v-else></div>
  </div>
</template>

<script>
import { EventBus } from "../event-bus";

export default {
  name: "Search",
  props: {},
  data: function() {
    return {
      terms: "",
      errors: [],
      modifiers: ""
    };
  },
  methods: {
    checkForm: function() {
      this.errors = [];
      let terms = this.terms,
        modifiers = this.modifiers;

      if (terms) terms = this.splitString(terms);
      if (modifiers) modifiers = this.splitString(modifiers);

      if (!terms.length) this.errors.push("Term(s) required.");
      if (!modifiers.length) this.errors.push("Modifier(s) required.");

      if (!this.errors.length) {
        EventBus.$emit("terms", terms);
        EventBus.$emit("modifiers", modifiers);
      }
    },

    splitString(str) {
      return str
        .split(/\r\n|\n|\r/)
        .map(x => x.trim())
        .filter(x => x);
    }
  }
};
</script>

<style>
</style>