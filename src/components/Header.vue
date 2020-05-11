<template>
  <header>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand tag="h1" class="mb-0">Lit2Hybrid</b-navbar-brand>
      <b-nav-text>a tool for multiplex literature mining.</b-nav-text>
    </b-navbar>
    <b-container fluid>
      <b-row align-h="center" cols="2">
        <b-col sm="3" order="1" align="left">
          <label for="textarea-small">Enter your search terms:</label>
          <b-form-textarea
            v-model="SearchTerms"
            id="textarea-small"
            size="md"
            rows="5"
            placeholder="query"
          ></b-form-textarea>
        </b-col>
        <b-col sm="3" order="3" align="left">
          <label for="textarea-small">Enter modifiers:</label>
          <b-form-textarea
            v-model="Modifiers"
            id="textarea-small"
            size="md"
            rows="5"
            placeholder="modifier"
          ></b-form-textarea>
        </b-col>
        <b-col class="row align-items-center" sm="3" order="3" align="right">
          <b-button
            pill
            variant="primary"
            lg="4"
            class="pb-2"
            padding:6px
            @click="emitSearchTerms"
          >Search</b-button>
        </b-col>
      </b-row>
    </b-container>
  </header>
</template>

<script>
import { EventBus } from "../event-bus";

export default {
  name: "Header",
  props: {},
  data: function() {
    return {
      SearchTerms: "",
      Modifiers: ""
    };
  },
  methods: {
    emitSearchTerms() {
      // to communicate data with parent components use this event-bus
      EventBus.$emit("search-terms", this.SearchTerms);
      EventBus.$emit("modifiers", this.Modifiers);
    }
  }
};
</script>

<style>
</style>