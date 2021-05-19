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

let tableColumnName; // For storing Table headers
let tableColumnKey; // For storing the keys to data
let tableData = []; // For stroing uploaded data
let tempData = []; // For temporarily storing uploaded data
let sortingDirection = []; // For tracking the sorting order


/**
 * The Root Function
 */
function createHTMLPage() {
  readConfig();
}

/**
 * Parsing and creating initial table header from stored config file.
 */
function readConfig() {
  fetch('config.json').then(response => {
    response.json().then(data => {
      // Parsing column Name and keys from stored config file
      let { columnName, columnKey } = parseHeaderConfig(data.columns);

      tableColumnKey = columnKey.slice();
      tableColumnName = columnName.slice();
      sortingDirection = [...new Array(tableColumnName.length).fill(true)];

      // Generating page header and necessary elements
      createPageHeader(data.title);

      // Creating Table elemnts
      createTableElement();

      // Added header to the table.
      createTableHeader(columnName);

      // For adding new data to table
      createRowForm(columnName);
    });
  });
}
/**
 * For parsing stored config file
 *
 * @param {Array} headerConfig
 * @return {Array, Array}
 */
function parseHeaderConfig(headerConfig) {
  let columnName = [];
  let columnKey = [];
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

/**
 * Creating Page Header form parsed data and added extra features
 *
 * @param {string} titleText
 */
function createPageHeader(titleText) {
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

/**
 * For file upload form.
 *
 * @return {HTMLFormElement}
 */
function addFileInput() {
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
    // resetting data
    tableData = [];
    // storing data
    tableData = [...tempData];
    tempData = [];
    // Loading new data
    refreshTable();
    form.reset();
  }, false);

  let appendButton = document.createElement('button');
  appendButton.id = "appendButton";
  appendButton.textContent = "Append Data";
  appendButton.type = 'button';

  appendButton.addEventListener('click', () => {
    // appending data to stored data
    tableData.push(...tempData);
    tempData = [];
    // Loading changed data
    refreshTable();
    form.reset();
  }, false);

  form.appendChild(fileInput);
  form.appendChild(uploadButton);
  form.appendChild(appendButton);

  return form;
}
/**
 * event handler of fileInput form.
 *
 */
function fileHandling() {
  let file = this.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    let fData = JSON.parse(reader.result);
    tempData = fData.slice();
  };
  reader.onerror = function () {
    console.log(reader.error);
  };
}
/**
 * For refreshing table after data change.
 *
 */
function refreshTable() {
  removeRows();
  parseData(tableData, tableColumnKey);
}

/**
 * Clearing table expect for the header
 */
function removeRows() {
  var table = document.getElementById('table');
  rowCount = table.rows.length;
  for (let i = rowCount - 1; i > 0; i--) {
    table.deleteRow(i);
  }
}
/**
 * For parsing user uploaded data
 * @param {Array} tableData
 * @param {Array} columnKey
 */
function parseData(tableData, columnKey) {
  for (let i = 0; i < tableData.length; i++) {
    createRowFromData(tableData[i], columnKey, i);
  }
}

/**
 * Creating a table row from the user uploaded data
 *
 * @param {Array} tableRowData
 * @param {Array[]} columnKey
 * @param {number} dataId
 */
function createRowFromData(tableRowData, columnKey, dataId) {
  let rowData = [];
  // Parsing data
  for (i = 0; i < columnKey.length; i++) {
    rowData.push(parseColumnData(tableRowData, columnKey[i]));
  }

  // generating table row
  let tBody = document.getElementById('tableBody');
  tBody.appendChild(createRow(rowData, dataId));
}

/**
 * Parsing individual cell data.
 *
 * @param {Object} object
 * @param {Array} key
 * @return {string}
 */
function parseColumnData(object, key) {
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

/**
 * Generating row for table and returning it
 * @param {Array} rowElements
 * @param {number} dataId
 * @param {boolean} headerFlag
 * @returns {HTMLTableRowElement}
 */
function createRow(rowElements, dataId, headerFlag = false) {
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

  return row;
}

/**
 * Deleteing selected data.
 *
 * @param {number} dataId
 */
function deleteTableRow(dataId) {
  tableData.splice(dataId, 1);
  refreshTable();
}


/**
 * generating table cell for individual row
 *
 * @param {string} columnElement
 * @param {number} rowIndex
 * @param {boolean} headerFlag
 * @return {HTMLTableDataCellElementColumn}
 */
function createColumn(columnElement, rowIndex, headerFlag) {
  let column;
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
    column.contentEditable = true;
    column.addEventListener('input', (event) => {
      event.preventDefault();
      let columnIndex = column.cellIndex;
      let value = document.getElementById('table')
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

/**
 * Update stored data after changed in table cell
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @param {string} value
 */
function updateValue(rowIndex, columnIndex, value) {
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

/**
 * Added Download button for downloading stored data
 * @returns {HTMLButtonElement}
 */
function addDownloadButton() {
  let button = document.createElement('button');
  button.textContent = "Download Data as JSON";
  button.type = 'button';
  button.id = 'downloadButton';
  button.addEventListener('click', downloadDataAsJSON, false);
  return button;
}
/**
 * Download event
 * Convert and makes the ready for download
 */
function downloadDataAsJSON() {
  if (tableData.length === 0) {
    alert("Add some data first!!!!");
  }
  else {
    let anchor = document.createElement('a');
    let dataStr = "data:text/json;charset=utf-8,"
      + encodeURIComponent(JSON.stringify(tableData));
    anchor.href = dataStr;
    anchor.download = "data.json";
    // anchor.setAttribute("download", "data.json");
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

/**
 * Table search function
 * @returns {HTMLInputElement}
 */
function addTableSearch() {
  let input = document.createElement('input');
  input.type = 'text';
  input.id = 'search'
  input.placeholder = 'Search Here'
  input.contentEditable = true;
  input.addEventListener('input', searchResult, false);
  return input;
}

/**
 * Table search event handler.
 */
function searchResult() {
  let input = document.getElementById('search');
  let searchText = input.value.toLowerCase();
  let table = document.getElementById("table");
  let tableRows = table.getElementsByTagName("tr");
  for (let i = 1; i < tableRows.length; i++) {
    tableColumns = tableRows[i].getElementsByTagName("td");
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

/**
 * Generating initial table
 */
function createTableElement() {
  let table = document.createElement('table');
  table.id = 'table';
  let tableBody = document.createElement('tbody');
  tableBody.id = 'tableBody';
  table.appendChild(tableBody);
  document.body.appendChild(table);
}

/**
 * Adding form for adding new data.
 * @param {Array} columnName
 */
function createRowForm(columnName) {
  let lineBreak = document.createElement('br');
  document.body.appendChild(lineBreak);


  let rowForm = document.createElement('form');
  rowForm.method = 'post';
  rowForm.id = "rowForm";

  for (let i = 0; i < columnName.length; i++) {
    let tempInput = document.createElement('input');
    tempInput.type = 'text';
    tempInput.id = columnName[i];
    tempInput.name = columnName[i];
    tempInput.placeholder = columnName[i];
    tempInput.required = true;
    rowForm.appendChild(tempInput);
  }

  let button = document.createElement('button');
  button.textContent = 'Add Data';
  button.type = 'submit';


  rowForm.appendChild(button);
  rowForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let object = {};
    // Processing data
    for (let i = 0; i < tableColumnKey.length; i++) {
      createDataObject(object, tableColumnKey[i], event.target[i].value);
    }
    // Adding data
    tableData.push(object);
    refreshTable();
    rowForm.reset();
  }, false);

  document.body.appendChild(rowForm);
}
/**
 *
 * @param {Object} obj
 * @param {string} keyPath
 * @param {string} value
 */
function createDataObject(obj, keyPath, value) {
  lastKeyIndex = keyPath.length - 1;
  for (var i = 0; i < lastKeyIndex; ++i) {
    key = keyPath[i];
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

/**
 * Generating Table Header
 * @param {Array} headerConfig
 */
function createTableHeader(headerConfig) {
  let tBody = document.getElementById('tableBody');
  tBody.appendChild(createRow(headerConfig, 0, true));
}

/**
 * For srting Table
 * @param {number} index
 */
function sortTable(index) {
  let direction = sortingDirection[index];
  sortingDirection[index] = !direction;
  let tBody = document.getElementById('tableBody');
  const tableRows = tBody.querySelectorAll('tr');
  const sortedRows = Array.from(tableRows);
  sortedRows.sort((rowA, rowB) => {
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
