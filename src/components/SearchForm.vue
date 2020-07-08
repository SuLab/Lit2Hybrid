<template>
  <div>
    <b-container>
      <b-row>
        <div class="example m-2">
          Example queries:
          <span class="link" @click="example1()">COVID-19 drugs</span>,
          <span class="link" @click="example2()">cancer genes</span>
        </div>
        <b-form class="row ml-3 mr-3 mb-3 float-left" inline>
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
                <b-popover target="info" triggers="hover focus" placement="right">
                  PubMed restricts users to three queries per second. To increase the rate of PubMed queries, please apply for an API key by following the instructions
                  <a
                    href="https://ncbiinsights.ncbi.nlm.nih.gov/2017/11/02/new-api-keys-for-the-e-utilities/"
                    target="_blank"
                  >
                    here
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
                value="true"
                unchecked-value="false"
              >Remember in this computer</b-form-checkbox>
            </b-form-checkbox-group>
            <b-button class="mt-3" variant="primary" @click="search">Search</b-button>
          </div>
        </b-form>
      </b-row>
    </b-container>
    <b-container>
      <b-row>
        <div v-if="errors.length">
          <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
          </ul>
        </div>
        <div v-else></div>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { EventBus } from "../event-bus";
import { Request } from "../request";
import { String } from "../string";
import { BIconInfoCircle } from "bootstrap-vue";

/* The list of events emitted by this component */
const emits = {
  terms: "terms",
  modifiers: "modifiers",
  apiKey: "apiKey"
};

const status = {
  invalid: 0,
  valid: 1,
  validating: 2,
  unknown: 4,
  empty: 5
};

export default {
  name: "SearchForm",
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
      termsChanged: false,
      modifiersChanged: false,
      apiKeyStatus: status.empty
    };
  },

  methods: {
    example1: function() {
      this.terms = "remdesivir \ndexamethasone \nDanoprevir";
      this.modifiers = "COVID-19 \nTMPRSS2 \nACE2";

      this.$nextTick(() => {
        this.search();
      });
    },

    example2: function() {
      this.terms = "BRCA1 \nKRAS \nIDH1";
      this.modifiers = "breast cancer \ncolon cancer \ngliblastoma";

      this.$nextTick(() => {
        this.search();
      });
    },

    validateapiKey: async function() {
      try {
        this.apiKeyStatus = status.validating;
        let term = this.termsArray[0];
        let valid = await Request.isApiKeyValid(term, this.apiKey);
        this.apiKeyStatus = valid ? status.valid : status.invalid;
      } catch (error) {
        this.apiKeyStatus = status.invalid;
        console.error(error);
      } finally {
        if (this.apiKeyStatus == status.valid) {
          this.emit();
          this.storeapiKey();
        } else {
          this.errors.push("Unable to validate your API Key.");
        }
      }
    },

    emit: function() {
      if (this.termsChanged) {
        EventBus.$emit(emits.terms, this.termsArray);
        this.termsChanged = false;
      }
      if (this.modifiersChanged) {
        EventBus.$emit(emits.modifiers, this.modifiersArray);
        this.modifiersChanged = false;
      }
      EventBus.$emit(emits.apiKey, this.apiKey);
    },

    storeapiKey: function() {
      if (this.apiKey) {
        if (this.checked == "true") {
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
      if (this.apiKeyStatus == status.invalid) {
        this.errors.push("Unable to validate your API Key.");
      }

      if (!this.errors.length) {
        if (this.apiKeyStatus == status.unknown) this.validateapiKey();

        if (
          this.apiKeyStatus == status.empty ||
          this.apiKeyStatus == status.valid
        ) {
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
      this.apiKeyStatus = this.apiKey ? status.unknown : status.empty;
    },

    terms: function() {
      this.termsChanged = true;
    },

    modifiers: function() {
      this.modifiersChanged = true;
    }
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
  }
};
</script>
<style>
.input-group-text {
  background-color: white;
  border: none;
}

.link {
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}

.example {
  font-size: 0.875rem;
}
</style>  