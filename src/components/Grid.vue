<template>
  <b-table
    ref="table"
    class="text-center"
    hover
    :bordered="true"
    :outlined="true"
    :fields="fields"
    :items="items"
    primary-key="rowIndex"
    sticky-header="100vh"
  >
    <template v-slot:cell()="data">
      <div v-if="url=getUrl(data)">
        <a :href="(url)" target="_blank">{{data.value}}</a>
      </div>
      <div v-else>{{data.value}}</div>
    </template>
  </b-table>
</template>
 

<script>
import { EventBus } from "../event-bus";
import { eUtils } from "../eUtils";

export default {
  name: "Grid",
  components: {},
  props: {},
  data: function() {
    return {
      terms: [],
      modifiers: [],
      requests: [],
    };
  },

  computed: {
    fields: function() {
      let fields = [];
      if (this.terms.length && this.modifiers.length) {
        let field = new Array();
        field["key"] = "#1!";
        field["label"] = "";
        field["isRowHeader"] = true;
        field["stickyColumn"] = true;
        field["variant"] = "info";
        fields.push(field);

        field = new Array();
        field["key"] = "#2!";
        field["label"] = "";
        fields.push(field);

        this.modifiers.forEach(modifier => {
          field = new Array();
          field["key"] = modifier;
          field["label"] = modifier;
          fields.push(field);
        });
      }
      return fields;
    },

    items: {
      get: function() {
        let items = [];
        if (this.fields.length) {
          let rowIndex = -1;
          const primaryKey = "rowIndex";

          let item = new Array();
          let column2 = this.fields[1].key;
          item[primaryKey] = ++rowIndex;
          item[column2] = "(self)";
          items.push(item);

          let column1 = this.fields[0].key;
          this.terms.forEach(term => {
            item = new Array();
            item[primaryKey] = ++rowIndex;
            item[column1] = term;
            items.push(item);
          });
        }
        return items;
      }
    }
  },
  watch: {
    items: function() {
      if (this.items.length) {
        this.getRequestList();
        this.requestAsync();
      }
    }
  },

  methods: {
    getUrl: function(data) {
      let columnKey = data["field"].key;
      let rowIndex = data["index"];

      if (columnKey == this.fields[0].key) return "";
      if (columnKey == this.fields[1].key && rowIndex == 0) return "";

      let columnHeader = data["field"].label;
      let rowHeader = this.items[rowIndex][this.fields[0].key];
      return eUtils.getPubmedUrl(rowHeader, columnHeader);
    },

    getRequestList: function() {
      this.items.forEach(item => {
        for (let index = 1; index < this.fields.length; index++) {
          let firstColumn = this.fields[0].key;

          let request = {
            rowIndex: item.rowIndex,
            rowHeader: item[firstColumn],
            columnKey: this.fields[index].key,
            columnHeader: this.fields[index].label
          };
          this.requests.push(request);
        }
      });
      this.requests.shift(); // first cell belong to (self)
    },

    requestAsync: async function() {
      let request = this.requests.shift();
      try {
        let url = eUtils.geteUtilsUrl(request.rowHeader, request.columnHeader);
        const response = await fetch(url);
        if (!response.ok) throw new Error(response);
        const json = await response.json();

        const count = json.esearchresult.count;
        this.items[request.rowIndex][request.columnKey] = count;

        this.$refs.table.refresh();
      } catch (error) {
        console.log(error);
      } finally {
        if (this.requests.length > 0) {
          // max 3 requests/second is the allowed rate by eUtils server
          setTimeout(this.requestAsync, 1000 / 3);
        }
      }
    }
  },
  created() {
    EventBus.$on("terms", terms => {
      this.terms = terms;
    });
    EventBus.$on("modifiers", modifiers => {
      this.modifiers = modifiers;
    });
  }
};
</script>

<style>
</style>