<template>
  <div>
    <b-navbar
      id="navbar"
      :style="{ 'top': headerY, 'position': 'fixed', 'width': '100%' }"
      toggleable="lg"
      type="dark"
      variant="info"
    >
      <b-navbar-brand tag="h1" class="mb-0 ml-auto">Lit2Hybrid</b-navbar-brand>
      <b-nav-text>a tool for multiplex literature mining.</b-nav-text>
    </b-navbar>
    <b-container :style="{ 'top': formY, 'position': 'fixed', 'width': '100%' }">
      <b-form class="row ml-3 mr-3 mt-3 mb-3 float-left" inline>
        <label for="inline-form-input-terms">Terms:</label>
        <b-form-textarea
          v-model="terms"
          class="mr-sm-5 mb-sm-0"
          rows="5"
          placeholder="Enter your search terms."
        ></b-form-textarea>

        <label for="inline-form-input-modifiers">Modifiers:</label>
        <b-form-textarea
          v-model="modifiers"
          class="mr-sm-5 mb-sm-0"
          rows="5"
          placeholder="Enter modifiers."
          autocomplete="true"
        ></b-form-textarea>

        <div>
          <label class="sr-only" for="inline-form-input-api-key">API Key</label>
          <b-input v-model="apikey" :trim="true" placeholder="API Key (optional)"></b-input>
          <b-form-checkbox
            class="mb-2 mr-sm-2 mb-sm-0"
            size="sm"
            v-model="checked"
            switch
          >Remember API key in this computer</b-form-checkbox>
          <b-button class="mt-3" variant="primary" @click="search">Search</b-button>
        </div>
      </b-form>
    </b-container>
    <div :style="{ 'padding-top': '234px'}">
      <div v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
        </ul>
      </div>
      <div v-else></div>
    </div>
  </div>
</template>

<script>
import { EventBus } from "../event-bus";
import { eUtils } from "../eUtils";

export default {
  name: "Search",
  props: {},
  data: function() {
    return {
      errors: [],
      terms: "",
      modifiers: "",
      apikey: "",
      checked: false,
      asyncCompleted: true,
      formY: "56px",
      headerY: "0px"
    };
  },

  methods: {
    handleScroll: function() {
      // Let the fixed header and form keep moving on vertical scrolling
      this.formY = (window.scrollY - 56) * -1 + "px";
      this.headerY = window.scrollY * -1 + "px";
    },

    validateApiKey: async function() {
      this.asyncCompleted = false;
      let term = this.termsArray[0],
        isValid = false;
      let url = eUtils.geteUtilsUrl(term, "", this.apikey);

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response);

        const json = await response.json();
        isValid = "count" in json.esearchresult;
      } catch (error) {
        console.log(error);
      } finally {
        if (isValid) {
          let interval = eUtils.ApiKeyRequestInterval;
          setTimeout(() => {
            this.emit();
            this.storeApiKey();
          }, interval);
        } else {
          this.errors.push("Unable to validate your api key.");
        }
        this.asyncCompleted = true;
      }
    },

    emit: function() {
      let form = {
        terms: this.termsArray,
        modifiers: this.modifiersArray,
        apikey: this.apikey
      };
      EventBus.$emit("form", form);
    },

    storeApiKey: function() {
      if (this.apikey) {
        if (this.checked == true) {
          if (sessionStorage.getItem("apikey")) {
            sessionStorage.removeItem("apikey");
          }
          localStorage.apikey = this.apikey;
        } else {
          if (localStorage.getItem("apikey")) {
            localStorage.removeItem("apikey");
          }
          sessionStorage.apikey = this.apikey;
        }
      }
    },

    search: function() {
      this.errors = [];
      if (!this.termsArray.length) {
        this.errors.push("Term(s) required.");
      }
      if (!this.modifiersArray.length) {
        this.errors.push("Modifier(s) required.");
      }
      if (!this.errors.length) {
        if (this.apikey) {
          if (this.asyncCompleted) this.validateApiKey();
        } else {
          this.emit();
          this.storeApiKey();
        }
      }
    },

    splitString(str) {
      return str
        .split(/\r\n|\n|\r/)
        .map(x => x.trim())
        .filter(x => x);
    }
  },

  computed: {
    termsArray: function() {
      return this.terms ? this.splitString(this.terms) : [];
    },

    modifiersArray: function() {
      return this.modifiers ? this.splitString(this.modifiers) : [];
    }
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  mounted() {
    if (localStorage.getItem("apikey")) {
      this.apikey = localStorage.apikey;
      this.checked = "true";
    } else {
      if (sessionStorage.getItem("apikey")) {
        this.apikey = sessionStorage.apikey;
      }
    }
    window.addEventListener("scroll", this.handleScroll);
  }
};
</script>
<style>
</style>  