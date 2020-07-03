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
        <label class="mr-1">Terms:</label>
        <b-form-textarea
          v-model="terms"
          class="mr-sm-5 mb-sm-0"
          rows="5"
          placeholder="Enter your search terms."
        ></b-form-textarea>

        <label class="mr-1">Modifiers:</label>
        <b-form-textarea
          v-model="modifiers"
          class="mr-sm-5 mb-sm-0"
          rows="5"
          placeholder="Enter modifiers."
          autocomplete="true"
        ></b-form-textarea>

        <div>
          <b-input-group>
            <b-input v-model="apiKey" :trim="true" placeholder="API Key (optional)"></b-input>
            <b-input-group-append>
              <span class="input-group-text">
                <b-icon-info-circle id="info" variant="info"></b-icon-info-circle>
              </span>
              <b-popover target="info" triggers="hover focus" placement="rightbottom">
                PubMed restricts users to three queries per second. To increase the rate of PubMed queries, please apply for an API key by following the instructions
                <a
                  href="https://ncbiinsights.ncbi.nlm.nih.gov/2017/11/02/new-api-keys-for-the-e-utilities/"
                  target="_blank"
                >
                  here
                  <br />
                  <br />
                </a>
              </b-popover>
            </b-input-group-append>
          </b-input-group>
          <b-form-checkbox-group size="sm">
            <b-form-checkbox
              class="mb-2 mr-sm-2 mb-sm-0"
              size="sm"
              v-model="checked"
            >Remember in this computer</b-form-checkbox>
          </b-form-checkbox-group>
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
import { Request } from "../request";
import { String } from "../string";
import { BIconInfoCircle } from "bootstrap-vue";

export default {
  name: "Search",
  components: {
    BIconInfoCircle
  },
  props: {},
  data: function() {
    return {
      errors: [],
      terms: "",
      modifiers: "",
      apiKey: "",
      checked: false,
      formY: "56px",
      headerY: "0px",
      isApiKeyValid: null,
      termsChanged: false,
      modifiersChanged: false
    };
  },

  methods: {
    handleScroll: function() {
      // let the fixed header and form keep moving on vertical scrolling
      this.formY = (window.scrollY - 56) * -1 + "px";
      this.headerY = window.scrollY * -1 + "px";
    },

    validateapiKey: async function() {
      try {
        let term = this.termsArray[0];
        this.isApiKeyValid = await Request.isApiKeyValid(term, this.apiKey);
      } catch (error) {
        this.isApiKeyValid = false;
        console.error(error);
      } finally {
        if (this.isApiKeyValid) {
          this.emit();
          this.storeapiKey();
        } else {
          this.errors.push("Unable to validate your API Key.");
        }
      }
    },

    emit: function() {
      if (this.termsChanged) {
        EventBus.$emit("terms", this.termsArray);
        this.termsChanged = false;
      }
      if (this.modifiersChanged) {
        EventBus.$emit("modifiers", this.modifiersArray);
        this.modifiersChanged = false;
      }
      EventBus.$emit("apiKey", this.apiKey);
    },

    storeapiKey: function() {
      if (this.apiKey) {
        if (this.checked == true) {
          if (sessionStorage.getItem("apiKey")) {
            sessionStorage.removeItem("apiKey");
          }
          localStorage.apiKey = this.apiKey;
        } else {
          if (localStorage.getItem("apiKey")) {
            localStorage.removeItem("apiKey");
          }
          sessionStorage.apiKey = this.apiKey;
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
      if (this.isApiKeyValid === false) {
        this.errors.push("Unable to validate your API Key.");
      }

      if (!this.errors.length) {
        if (this.apiKey && this.isApiKeyValid === null) this.validateapiKey();

        if (!this.apiKey || this.isApiKeyValid) {
          this.emit();
          this.storeapiKey();
        }
      }
    }
  },

  computed: {
    termsArray: function() {
      return this.terms ? String.split(this.terms) : [];
    },

    modifiersArray: function() {
      return this.modifiers ? String.split(this.modifiers) : [];
    }
  },

  watch: {
    apiKey: function() {
      this.isApiKeyValid = null;
    },

    terms: function() {
      this.termsChanged = true;
    },

    modifiers: function() {
      this.modifiersChanged = true;
    }
  },

  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },

  mounted() {
    if (localStorage.getItem("apiKey")) {
      this.apiKey = localStorage.apiKey;
      this.checked = "true";
    } else {
      if (sessionStorage.getItem("apiKey")) {
        this.apiKey = sessionStorage.apiKey;
      }
    }
    window.addEventListener("scroll", this.handleScroll);
  }
};
</script>
<style>
.input-group-text {
  background-color: white;
  border: none;
}
</style>  