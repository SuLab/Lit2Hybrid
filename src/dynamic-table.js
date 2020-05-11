export class DynamicTable {
    constructor(searchTerms, modifiers) {
        this.searchTerms = searchTerms;
        this.modifiers = modifiers;
        this.table = []; 
        this.createColumnHeaders();
        this.createRowHeaders();
    }

    addRow(item) {
        this.table.push(item);
    }

    generateColumnKey(columnKeys) {
        let key = -1;
        do {
            ++key;
        } while (columnKeys.includes(key) || this.searchTerms.includes(key))

        return key;
    }

    createColumnHeaders(blankColumns = 2) {
        let item = [], columnKeys = [];
        
        // add two blank columns
        for (let i=0; i<blankColumns; ++i){
            let key = this.generateColumnKey(columnKeys);
            columnKeys.push(key);
        }

        columnKeys = columnKeys.concat(this.searchTerms);

        // add a blank row        
        columnKeys.forEach(key => {
            item[key] = "";
        });
        this.addRow(item);
    }

    createRowHeaders() {
        var firstColumn = this.columnHeaders[0];

        this.modifiers.forEach(modifier => {
            var item = new Array();
            item[firstColumn] = modifier;
            this.addRow(item);
        });
    }

    getRowHeader(rowIndex) {
        return this.table[rowIndex][0];
    }

    getColumnHeader(columnIndex) {
        return Object.keys(this.table[0])[columnIndex];
    }

    get rowCount() {
        return this.table.length;
    }

    get columnCount() {
        return Object.keys(this.table[0]).length;
    }

    get columnHeaders() {
        return Object.keys(this.table[0]);
    }

    getCellValue(rowIndex, columnIndex) {
        return this.table[rowIndex][columnIndex];
    }

    setCellValue(rowIndex, columnIndex, value) {
        let columnHeader = this.getColumnHeader(columnIndex);
        this.table[rowIndex][columnHeader] = value;
    }

    getTableCells() {
        let tableCells = [];

        // first column goes for column header
        for (let rowIndex = 0; rowIndex < this.rowCount; ++rowIndex)

            for (let columnIndex = 1; columnIndex < this.columnCount; ++columnIndex) {

                tableCells.push({ rowIndex: rowIndex, columnIndex: columnIndex })
            }
        return tableCells;
    }
}