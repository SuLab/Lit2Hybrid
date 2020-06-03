<template>
  <div>
    <b-table
      ref="table"
      class="text-center table"
      hover
      :bordered="true"
      :outlined="true"
      :fields="fields"
      :items="items"
      primary-key="rowKey"
    >
      <template v-slot:cell(___#col0!)="data">
        <div v-if="data['item']['rowKey'] == '___#rowend!'">
          <b-button class="addButton" v-b-modal.modal-add-rows variant="light">+ Add Terms</b-button>
          <b-modal id="modal-add-rows" title="Add terms" ok-title="Add" @ok="addRows" ok-only>
            <b-form-textarea
              v-model="modalRows"
              class="mr-sm-5 mb-sm-0"
              rows="5"
              placeholder="Enter your search terms."
              autofocus
            ></b-form-textarea>
          </b-modal>
        </div>
        <div v-else>{{data.value}}</div>
      </template>

      <template v-slot:head(___#colend!)>
        <b-button class="addButton" v-b-modal.modal-add-columns variant="light">+ Add Terms</b-button>
        <b-modal id="modal-add-columns" title="Add terms" ok-title="Add" @ok="addColumns" ok-only>
          <b-form-textarea
            v-model="modalColumns"
            class="mr-sm-5 mb-sm-0"
            rows="5"
            placeholder="Enter your search terms."
            autofocus
          ></b-form-textarea>
        </b-modal>
      </template>

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
import { String } from "../string";
import { Request } from "../request";

export default {
  name: "Grid",
  components: {},
  props: {},
  cancelAsync: false,
  data: function() {
    return {
      terms: [],
      modifiers: [],
      apiKey: null,
      modalColumns: "",
      modalRows: "",
      rowsMap: new Map(),
      columnsMap: new Map(),
      maxTry: 0,
      requestQueue: []
    };
  },

  computed: {
    columns: function() {
      if (this.modifiers.length) {
        if (this.columnsMap.size == 0) {
          let field = new Object();
          field["key"] = "___#col0!";
          field["label"] = "";
          field["isRowHeader"] = true;
          field["class"] = "rowheader";
          this.columnsMap.set(field["key"], field);

          field = new Object();
          field["key"] = "___#col1!";
          field["label"] = "";
          this.columnsMap.set(field["key"], field);
        }
        this.columnsMap.delete("___#colend!");

        this.modifiers.forEach(modifier => {
          let field = new Object();
          field["key"] = modifier;
          field["label"] = modifier;
          if (!this.columnsMap.has(modifier))
            this.columnsMap.set(modifier, field);
        });
        let field = new Object();
        field["key"] = "___#colend!";
        field["label"] = "";
        field["class"] = "lastColumn";
        this.columnsMap.set(field["key"], field);
      }
      return this.columnsMap;
    },

    rows: function() {
      if (this.terms.length) {
        if (this.rowsMap.size == 0) {
          let item = new Object();
          let column2 = this.columnKeys[1];
          item["rowKey"] = "___#row0!";
          item[column2] = "(self)";
          item["rowHeader"] = "";
          this.rowsMap.set(item["rowKey"], item);
        }
        this.rowsMap.delete("___#rowend!");

        let column1 = this.columnKeys[0];
        this.terms.forEach(term => {
          let item = new Object();
          item["rowKey"] = term;
          item[column1] = term;
          item["rowHeader"] = term;
          if (!this.rowsMap.has(term)) this.rowsMap.set(term, item);
        });

        let item = new Object();
        item["rowKey"] = "___#rowend!";
        item[this.blankColumn] = "";
        item["rowHeader"] = "";
        this.rowsMap.set(item["rowKey"], item);
      }
      return this.rowsMap;
    },

    fields: function() {
      return [...this.columns.values()];
    },

    items: function() {
      return [...this.rows.values()];
    },

    columnKeys: function() {
      return [...this.columns.keys()];
    },

    rowKeys: function() {
      return [...this.rows.keys()];
    },

    blankRow: function() {
      return [...this.rowKeys].pop();
    },

    blankColumn: function() {
      return [...this.columnKeys].pop();
    },

    requestInterval: function() {
      return this.apiKey
        ? eUtils.ApiKeyRequestInterval
        : eUtils.RequestInterval;
    }
  },

  watch: {
    items: function() {
      this.createRequestQueue();
      this.requestAsync();
    }
  },

  methods: {
    createRequestQueue() {
      this.requestQueue = [];

      for (let [rowKey, row] of this.rows) {
        for (let [columnKey, column] of this.columns) {
          let req = {
            rowKey: rowKey,
            rowHeader: row.rowHeader,
            columnKey: columnKey,
            columnHeader: column.label
          };
          if (this.isCellValid(req)) this.requestQueue.push(req);
        }
      }
    },

    isCellValid(request) {
      // ignore the first column which goes to row header
      if (request.columnKey == this.columnKeys[0]) return false;

      // ignore the last column and row which is intentionally left blank
      if (request.columnKey == this.blankColumn) return false;
      if (request.rowKey == this.blankRow) return false;

      // ignore (self) cell or such dummy cells
      if (!request.rowHeader && !request.columnHeader) return false;

      // pick only the empty cells
      if (this.getValue(request.rowKey, request.columnKey)) return false;

      return true;
    },

    addColumns: function() {
      let modifiers = String.split(this.modalColumns);
      this.modalColumns = "";
      this.cancelPending(() => {
        this.modifiers = this.modifiers.concat(modifiers);
      });
    },

    addRows: function() {
      let terms = String.split(this.modalRows);
      this.modalRows = "";
      this.cancelPending(() => {
        this.terms = this.terms.concat(terms);
      });
    },

    cancelPending: function(func) {
      if (!this.cancelAsync) {
        this.wait(func);
      }
    },

    wait: function(func) {
      if (this.requestQueue.length == 0) {
        console.info("No pending operation(s)");
        this.maxTry = 0;
        this.cancelAsync = false;
        func();
      } else {
        if (++this.maxTry == 30) {
          console.error("Unknown error has occured.");
          console.error("Please try checking your network connectivity.");
          this.maxTry = 0;
          this.cancelAsync = false;
        } else {
          this.cancelAsync = true;
          console.info(
            `Total pending operation(s): ${this.requestQueue.length}`
          );
          console.info(
            `Attempt ${this.maxTry} to cancel pending operation(s).`
          );
          setTimeout(this.wait, this.maxTry * 1000, func);
        }
      }
    },

    getUrl: function(data) {
      let rowKey = data["item"].rowKey;
      let rowHeader = data["item"].rowHeader;
      let columnKey = data["field"].key;
      let columnHeader = data["field"].label;

      if (columnKey == this.columnKeys[0]) return "";
      if (columnKey == this.columnKeys[1] && rowKey == this.rowKeys[0])
        return "";

      return eUtils.getPubmedUrl(rowHeader, columnHeader);
    },

    getValue: function(rowKey, columnKey) {
      let row = this.rows.get(rowKey);
      return row[columnKey];
    },

    setValue: function(rowKey, columnKey, value) {
      let row = this.rows.get(rowKey);
      row[columnKey] = value;
    },

    requestAsync: async function() {
      let request = this.requestQueue.shift();
      try {
        const count = await Request.getCount(
          request.rowHeader,
          request.columnHeader,
          this.apiKey
        );

        this.setValue(request.rowKey, request.columnKey, count);
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
    }
  },
  created() {
    EventBus.$on("modifiers", modifiers => {
      this.cancelPending(() => {
        this.columns.clear();
        this.rows.clear();
        this.modifiers = modifiers;
      });
    });

    EventBus.$on("terms", terms => {
      this.cancelPending(() => {
        this.rows.clear();
        this.terms = terms;
      });
    });

    EventBus.$on("apiKey", apiKey => (this.apiKey = apiKey));
  }
};
</script>

<style>
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
  background: white;
}

thead th:first-child {
  left: 0;
  z-index: 1;
}

.lastColumn {
  width: 1px;
  min-width: 127px;
}

.rowheader {
  width: 1px;
  min-width: 250px;
}

.addButton {
  color: green;
  font-weight: bold;
  font-size: 12.5px;
}
</style>