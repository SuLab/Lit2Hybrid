<template>
  <div id="table">
    <b-table
      ref="table"
      class="text-center"
      hover
      :bordered="true"
      :outlined="true"
      :fields="fields"
      :items="items"
      primary-key="rowIndex"
    >
      <template v-slot:cell()="data">
        <div v-if="url=getUrl(data)">
          <a :href="(url)" target="_blank">{{data.value}}</a>
        </div>
        <div v-else>{{data.value}}</div>
      </template>
    </b-table>
  </div>
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
      apikey: null,
      requestQueue: [],
      cancelAsync: false
    };
  },

  computed: {
    fields: function() {
      let fields = [];
      if (this.terms.length && this.modifiers.length) {
        let field = new Array();
        field["key"] = Math.floor(Math.random() * 100).toString();
        field["label"] = "";
        field["isRowHeader"] = true;
        field["variant"] = "info";
        fields.push(field);

        field = new Array();
        field["key"] = Math.floor(Math.random() * 100).toString();
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

    items: function() {
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
    },

    cells: function() {
      let cells = [];
      if (this.items.length) {
        this.items.forEach(item => {
          for (let index = 1; index < this.fields.length; index++) {
            let firstColumn = this.fields[0].key;

            let request = {
              rowIndex: item.rowIndex,
              rowHeader: item[firstColumn],
              columnKey: this.fields[index].key,
              columnHeader: this.fields[index].label
            };
            cells.push(request);
          }
        });
        cells.shift(); // first cell belong to (self)
      }
      return cells;
    },

    requestInterval: function() {
      return this.apikey
        ? eUtils.ApiKeyRequestInterval
        : eUtils.RequestInterval;
    }
  },

  watch: {
    cells: function() {
      this.requestQueue = this.cells.slice();
      this.requestAsync();
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

    requestAsync: async function() {
      let request = this.requestQueue.shift();
      try {
        let url = eUtils.geteUtilsUrl(
          request.rowHeader,
          request.columnHeader,
          this.apikey
        );
        const response = await fetch(url);
        if (!response.ok) throw new Error(response);
        const json = await response.json();

        const count = json.esearchresult.count;
        this.items[request.rowIndex][request.columnKey] = count;

        this.$refs.table.refresh();
      } catch (error) {
        console.log(error);
      } finally {
        if (this.cancelAsync) this.requestQueue = [];

        if (this.requestQueue.length > 0) {
          console.log("Interval: " + this.requestInterval);
          setTimeout(this.requestAsync, this.requestInterval);
        }
      }
    },

    wait: function(form) {
      if (this.requestQueue.length > 0) {
        console.log("Attempting to cancel an ongoing operation");
        this.cancelAsync = true;
        setTimeout(this.wait, 1000, form);
      } else {
        this.cancelAsync = false;
        this.terms = form.terms;
        this.modifiers = form.modifiers;
        this.apikey = form.apikey;
      }
    }
  },
  created() {
    EventBus.$on("form", form => {
      if (this.terms == form.terms && this.modifiers == form.modifiers) {
        this.apikey = form.apikey;
      } else this.wait(form);
    });
  }
};
</script>

<style>
/* #table {
  padding-top: 234px;
} */

thead th {
  position: -webkit-sticky;
  position: sticky;
  top: 0px;
  background: white;
}

tbody th {
  position: -webkit-sticky;
  position: sticky;
  left: 0;
}

thead th:first-child {
  left: 0;
  z-index: 1;
}
</style>