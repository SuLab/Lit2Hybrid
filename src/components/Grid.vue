<template>
  <b-container>

<p>{{stopwatch}} </p>
    <div id="table_template" class="text-center">
      <b-table
        :sticky-header="stickyHeader"
        :no-border-collapse="noCollapse"
        :bordered="true"
        :outlined="true"
        :responsive="true"
        :items="items"
      >
        <template v-slot:cell()="data">
          <span v-html="data.value"></span>
        </template>
      </b-table>
    </div>
  </b-container>
</template>
 

<script>
import { EventBus } from "../event-bus";
import { eUtils } from "../eUtils";
import { DynamicTable } from "../dynamic-table";

export default {
  name: "Grid",
  components: {},
  props: {},  
  data: function() {
    return {
      stickyHeader: true,
      noCollapse: false,
      newsearchTerms: "",
      modifiers: "",
      count: "count",
      items: [],
      table: null,
      asyncRequests: [],
      requestBatch: [],
      stopwatch: 0
    };
  },

  methods: {
    stopwatchfun: function() {
      this.stopwatch++;

      setTimeout( this.stopwatchfun, 1000 );
    },
    populateTable: function() {
      if (this.newsearchTerms && this.modifiers) {
        let searchTerms = eUtils.ValidateInputString(this.newsearchTerms);
        let modifiers = eUtils.ValidateInputString(this.modifiers);
        this.table = new DynamicTable(searchTerms, modifiers);
        this.items = this.table.table;
        this.fillDummyCells();
        this.getAsyncRequests();
        this.stopwatchfun();
        this.fetchData();
      }
    },

    fillDummyCells: function() {
      let tableCells = this.table.getTableCells();
      let firstCell = tableCells.shift();
      this.table.setCellValue(
        firstCell.rowIndex,
        firstCell.columnIndex,
        "(self)"
      );
    },

    getAsyncRequests: function() {
      let cells = this.table.getTableCells();
      cells.shift(); // first cell will have a hardcoded value - (self)

      cells.forEach(cell => {
        let rowHeader = this.table.getRowHeader(cell.rowIndex);
        let columnHeader = this.table.getColumnHeader(cell.columnIndex);
        if (cell.rowIndex == 0) rowHeader = "";
        if (cell.columnIndex == 1) columnHeader = "";

        let eUtilsUrl = eUtils.geteUtilsUrl(rowHeader, columnHeader);
        let pubmedUrl = eUtils.GetPubmedUrl(rowHeader, columnHeader);

        let request = {
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          searchTerm: rowHeader,
          modifier: columnHeader,
          eUtilsUrl: eUtilsUrl,
          pubmedUrl: pubmedUrl
        };
        this.asyncRequests.push(request);
      });
    },

    fetchData: function() {
      if (this.asyncRequests.length == 0) return;

      let request = this.asyncRequests.shift();
      this.requestBatch.push(request);

      if (this.requestBatch.length == 3 || this.asyncRequests.length == 0) {
        try {
          let requestCopy = this.requestBatch;
          let obj = this;
          Promise.all(requestCopy.map(request => fetch(request.eUtilsUrl)))
            .then(result => Promise.all(result.map(v => v.json())))
            .then(datas => {
              for (let i = 0; i < datas.length; ++i) {
                var count = datas[i].esearchresult.count;
                let cell = requestCopy[i];
                let value = count.link(cell.pubmedUrl);
                obj.table.setCellValue(cell.rowIndex, cell.columnIndex, value);
                obj.$forceUpdate();
              }
            });
        } catch (error) {
          console.log("From getAsyncData: " + error);
        } finally {
          this.requestBatch = [];
          if (this.asyncRequests.length > 0) {
            setTimeout(this.fetchData, 2000);            
          }
        }
      } else {
        this.fetchData();
      }
    }
  },
  created() {
    EventBus.$on("search-terms", terms => {
      this.newsearchTerms = terms;
    });
    EventBus.$on("modifiers", modifiers => {
      this.modifiers = modifiers;
      this.populateTable();
    });
  }
};
</script>

<style>
th.table-b-table-default:nth-child(-n+2) {
  visibility: hidden;
}
</style>