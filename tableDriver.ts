/* requirement checklist
(Done)Task 1. Table will be ready from conifg.
(Done)Task 2. Data will be shown after data.json upload.
(Done)Task 3: First Upload should be upload. (Can do with table row length)
(Done)Task 4. JSON Upload has 2 options. Upload(reset the data) and Concat(With previous uploads).
(Done)Task 5. Row Delete with button.
(Done)Task 6. Edited data should be saved on main json.
(Done)Task 7. Export JSON.
(Done)Task 8. Can add new Data.
*/
let storage = window.localStorage;
let tableColumnName: string[] = [];
let tableColumnKey: (string | string[])[] = [];
let tableData: any[] = [];
let tempData: any[] = [];
let sortingDirection: boolean[] = [];

function createHTMLPage(): void {
  fetch('config.json').then(response => {
    response.json().then(data => {
      let { columnName, columnKey } = parseHeaderConfig(data.columns);

      tableColumnKey = columnKey.slice();
      tableColumnName = columnName.slice();

      // localStorage.setItem("tableColumnKey", tableColumnName.toString());
      // console.log();


      fillSortingDirection(tableColumnName.length);

      // Generating page header and necessary elements
      createPageHeader(data.title);

      // Creating Table elemnts
      createTableElement();

      // Added header to the table.
      createTableHeader();

      // For adding new data to table
      createRowForm();

      if (getLocalTableData()) {
        tableData = getLocalTableData();
        parseData(tableData, tableColumnKey);
      }
    })
  })
}

function fillSortingDirection(arrLength: number): void {
  for (let i = 0; i < arrLength; i++) {
    sortingDirection.push(true);
  }
}

function parseHeaderConfig(headerConfig: any) {
  let columnName: string[] = []
  let columnKey: (string | string[])[] = [];
  for (let i = 0; i < headerConfig.length; i++) {
    if (headerConfig[i].hasOwnProperty('header')) {
      if (headerConfig[i].header.length > 0) {
        columnName.push(headerConfig[i].header);
      }
      else {
        alert("Please Correctly update the config header elements!!!");
        throw (new Error('Config File Header Element Error!'));
        break;
      }
    }
    else {
      alert("Please Correctly update the config file!!!");
      throw (new Error('Config File Header Element Error!'));
      break;
    }
    if (headerConfig[i].hasOwnProperty('cell')) {
      if (headerConfig[i].cell.length > 0) {
        let keys = headerConfig[i].cell;
        columnKey.push(keys.split('.'));
      }
      else {
        alert("Please Correctly update the config cell elements!!!");
        throw (new Error('Config File Header Element Error!'));
        break;
      }
    }
    else {
      alert("Please Correctly update the config file");
      throw (new Error('Config File Cell Element Error'));
      break;
    }
  }
  return { columnKey, columnName };
}

function createPageHeader(titleText: string): void {
  let headerDiv = document.createElement('div');
  headerDiv.id = "header";

  let pageTitleElement = document.createElement('h1');
  pageTitleElement.id = "pageTitle";
  let pageTitleText = document.createTextNode(titleText);

  pageTitleElement.appendChild(pageTitleText);
  headerDiv.appendChild(pageTitleElement);

  // adding file upload option
  headerDiv.appendChild(addFileInput());

  let lineBreak = document.createElement('br');
  document.body.appendChild(lineBreak);

  // For exporting data.
  headerDiv.appendChild(addDownloadButton());
  document.body.appendChild(lineBreak);

  // Adding searching feature
  headerDiv.appendChild(addTableSearch());
  document.body.appendChild(lineBreak);

  document.body.appendChild(headerDiv);
  document.body.appendChild(lineBreak);
}

function addFileInput(): HTMLFormElement {
  let form = document.createElement('form');
  form.id = 'file';
  form.method = 'post';

  let fileInput = document.createElement('input');
  fileInput.setAttribute('type', 'file');
  fileInput.id = 'fileInput';
  fileInput.addEventListener('change', fileHandling, false);

  let uploadButton = document.createElement('button');
  uploadButton.id = "uploadButton";
  uploadButton.textContent = "Upload Data";
  uploadButton.type = 'button';

  uploadButton.addEventListener('click', () => {
    if (fileInput.files.length !== 0) {
      // resetting data
      tableData = [];
      // storing data
      tableData = [...tempData];
      tempData = [];
      // Loading new data
      refreshLocalTableData();
      form.reset();
    }
  }, false);

  let appendButton = document.createElement('button');
  appendButton.id = "appendButton";
  appendButton.textContent = "Append Data";
  appendButton.type = 'button';

  appendButton.addEventListener('click', () => {
    if (fileInput.files.length !== 0) {
      // appending data to stored data
      tableData.push(...tempData);
      tempData = [];
      // Loading changed data
      refreshLocalTableData();
      form.reset();
    }
  }, false);

  form.appendChild(fileInput);
  form.appendChild(uploadButton);
  form.appendChild(appendButton);

  return form;
}
function fileHandling(this: any) {
  let file = this.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    let fData = JSON.parse(<string>reader.result);
    tempData = fData.slice();
  };
  reader.onerror = function () {
    console.log(reader.error);
  };
}

function getLocalTableData() {
  return JSON.parse(storage.getItem('tabledata'))
}

function refreshLocalTableData() {
  storage.setItem('tabledata', JSON.stringify(tableData));
  tableData = getLocalTableData();
  refreshTable();
}

function refreshTable() {
  removeRows();
  parseData(tableData, tableColumnKey);
}

function removeRows() {
  var table = <HTMLTableElement>document.getElementById('table');
  let rowCount = table.rows.length;
  for (let i = rowCount - 1; i > 0; i--) {
    table.deleteRow(i);
  }
}

function parseData(tableData: any[], columnKey: (string | string[])[]) {
  for (let i = 0; i < tableData.length; i++) {
    createRowFromData(tableData[i], columnKey, i);
  }
}

function createRowFromData(tableRowData: any, columnKey: (string | string[])[], dataId: number) {
  let rowData = [];
  // Parsing data
  for (let i = 0; i < columnKey.length; i++) {
    rowData.push(parseColumnData(tableRowData, columnKey[i]));
  }

  // generating table row
  let tBody = document.getElementById('tableBody');
  tBody.appendChild(createRow(rowData, dataId));
}

function parseColumnData(object: any, key: (string | string[])) {
  let tempObject = { ...object };
  for (let i = 0; i < key.length; i++) {
    if (tempObject.hasOwnProperty(key[i])) {
      if (typeof tempObject[key[i]] === "object") {
        tempObject = { ...tempObject[key[i]] };
      }
      else {
        return tempObject[key[i]];
      }
    }
    else {
      return "-";
    }
  }
}

function createRow(rowElements: string[], dataId: number, headerFlag: boolean = false): HTMLTableRowElement {
  let row = document.createElement('tr');
  for (let i = 0; i < rowElements.length; i++) {
    row.appendChild(createColumn(rowElements[i], dataId, headerFlag));
  }
  if (!headerFlag) {
    // Added Edit option for table cell and delete for table row
    let btnColumn = document.createElement('td');
    let button = document.createElement('button');
    button.textContent = 'Delete';
    button.type = 'button';
    button.addEventListener('click', () => {
      deleteTableRow(dataId);
    }, false);
    btnColumn.appendChild(button);
    row.appendChild(btnColumn);
  }
  else {
    let actionColumn = document.createElement('th');
    let actionText = document.createTextNode("Action");
    actionColumn.appendChild(actionText);
    row.appendChild(actionColumn)
  }
  return row;
}

function deleteTableRow(dataId: number) {
  tableData.splice(dataId, 1);
  refreshLocalTableData();
}


function createColumn(columnElement: string, rowIndex: number, headerFlag: boolean) {
  let column: (HTMLTableHeaderCellElement | HTMLTableDataCellElement);
  if (headerFlag) {
    column = document.createElement('th');
  }
  else {
    column = document.createElement('td');
  }
  let columnText = document.createTextNode(columnElement);
  column.style.cursor = "pointer";
  column.appendChild(columnText);
  if (!headerFlag) {
    column.contentEditable = "true";
    // column.contentEditable = true;
    column.addEventListener('input', (event) => {
      event.preventDefault();
      let columnIndex = column.cellIndex;
      let value = (<HTMLTableElement>document.getElementById('table'))
        .rows[rowIndex + 1].cells[columnIndex].textContent;
      updateValue(rowIndex, columnIndex, value);
    });
  }
  else {
    // Sorting event for table header
    column.addEventListener('click', () => {
      let columnIndex = column.cellIndex;
      sortTable(columnIndex);
    })
  }
  return column;
}


function updateValue(rowIndex: number, columnIndex: number, value: string) {
  let data = tableData[rowIndex];
  let keys = tableColumnKey[columnIndex];
  for (let i = 0; i < keys.length; i++) {
    if (typeof data[keys[i]] === "object") {
      data = data[keys[i]];
    }
    else {
      data[keys[i]] = value;
    }
  }
}


function addDownloadButton(): HTMLButtonElement {
  let button = document.createElement('button');
  button.textContent = "Download Data as JSON";
  button.type = 'button';
  button.id = 'downloadButton';
  button.addEventListener('click', downloadDataAsJSON, false);
  return button;
}


function downloadDataAsJSON(): void {
  if (tableData.length === 0) {
    alert("Add some data first!!!!");
  }
  else {
    let anchor = document.createElement('a');
    let dataStr = "data:text/json;charset=utf-8,"
      + encodeURIComponent(JSON.stringify(tableData));
    anchor.href = dataStr;
    anchor.download = "data.json";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

function addTableSearch() {
  let input = document.createElement('input');
  input.type = 'text';
  input.id = 'search'
  input.placeholder = 'Search Here'
  input.contentEditable = "true";
  input.addEventListener('input', searchResult, false);
  return input;
}


function searchResult() {
  let input = <HTMLInputElement>document.getElementById('search');
  let searchText = input.value.toLowerCase();
  let table = document.getElementById("table");
  let tableRows = table.getElementsByTagName("tr");
  for (let i = 1; i < tableRows.length; i++) {
    let tableColumns = tableRows[i].getElementsByTagName("td");
    let searchFlag = false;
    for (let j = 0; j < tableColumns.length; j++) {
      let cell = tableColumns[j];
      let textValue = cell.textContent;
      if (textValue.toLowerCase().indexOf(searchText) > -1) {
        searchFlag = true;
        break;
      }
    }
    if (searchFlag) {
      tableRows[i].style.display = "";
    }
    else {
      tableRows[i].style.display = "none";
    }
  }
}


function createTableElement() {
  let table = document.createElement('table');
  table.id = 'table';
  let tableBody = document.createElement('tbody');
  tableBody.id = 'tableBody';
  table.appendChild(tableBody);
  document.body.appendChild(table);
}


function createRowForm() {
  let lineBreak = document.createElement('br');
  document.body.appendChild(lineBreak);


  let rowForm = document.createElement('form');
  rowForm.method = 'post';
  rowForm.id = "rowForm";

  for (let i = 0; i < tableColumnName.length; i++) {
    let tempInput = document.createElement('input');
    tempInput.type = 'text';
    tempInput.id = tableColumnName[i];
    tempInput.name = tableColumnName[i];
    tempInput.placeholder = tableColumnName[i];
    tempInput.required = true;
    rowForm.appendChild(tempInput);
  }

  let button = document.createElement('button');
  button.textContent = 'Add Data';
  button.type = 'submit';


  rowForm.appendChild(button);
  rowForm.addEventListener('submit', (event: any) => {
    event.preventDefault();
    let object = {};
    // Processing data
    for (let i = 0; i < tableColumnKey.length; i++) {
      let data = event.target
      createDataObject(object, tableColumnKey[i], event.target[i].value);
    }
    // Adding data
    tableData.push(object);
    refreshLocalTableData();
    rowForm.reset();
  }, false);

  document.body.appendChild(rowForm);
}


function createDataObject(obj: any, keyPath: (string | string[]), value: string) {
  let lastKeyIndex = keyPath.length - 1;
  for (var i = 0; i < lastKeyIndex; ++i) {
    let key = keyPath[i];
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

function createTableHeader() {
  let tBody = document.getElementById('tableBody');
  tBody.appendChild(createRow(tableColumnName, 0, true));

}
function sortTable(index: number) {
  let direction = sortingDirection[index];
  sortingDirection[index] = !direction;
  let tBody = <HTMLTableSectionElement>document.getElementById('tableBody');
  const tableRows = tBody.querySelectorAll('tr');
  //@ts-ignore
  const sortedRows = Array.from(tableRows);
  sortedRows.sort((rowA: any, rowB: any) => {
    if (rowA.querySelectorAll('th').length > 0) {
      return -1;
    }
    else if (rowB.querySelectorAll('th').length > 0) {
      return 1;
    }
    let cellA = rowA.querySelectorAll('td')[index].textContent.toLowerCase();
    let cellB = rowB.querySelectorAll('td')[index].textContent.toLowerCase();

    if (cellA === cellB) {
      return 0;
    }
    if (direction) {
      if (cellA > cellB) {
        return 1;
      }
      else {
        return -1;
      }
    }
    else {
      if (cellA > cellB) {
        return -1;
      }
      else {
        return 1;
      }
    }
  })
  removeRows();
  for (let i = 1; i < sortedRows.length; i++) {
    tBody.appendChild(sortedRows[i]);
  }
}

createHTMLPage();
