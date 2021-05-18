/* requirement checklist
(Done)Task 1. Table will be ready from conifg.
(Done)Task 2. Data will be shown after data.json upload.
(Done)Task 3: First Upload should be upload. (Can do with table row length)
(Done)Task 4. JSON Upload has 2 options. Upload(reset the data) and Concat(With previous uploads).
(Done)Task 5. Row Delete with button.
Task 6. Edited data should be saved on main json.
(Done)Task 7. Export JSON.
*/

let tableColumnKey;
let tableColumnName;
let tableData = [];
let tempData = [];

function createHTMLPage() {
  readConfig();
}

function readConfig() {
  fetch('config.json').then(response => {
    response.json().then(data => {
      let { columnName, columnKey } = parseHeaderConfig(data.columns);
      tableColumnKey = columnKey.slice();
      tableColumnName = columnName.slice();
      createPageTitle(data.title);
      createTableElement();
      createTableHeader(columnName);
      // createRowForm(columnName);
    });
  });
}

function createPageTitle(titleText) {
  let headerDiv = document.createElement('div');
  headerDiv.id = "header";

  let pageTitleElement = document.createElement('h1');
  pageTitleElement.id = "pageTitle";
  let pageTitleText = document.createTextNode(titleText);

  pageTitleElement.appendChild(pageTitleText);
  headerDiv.appendChild(pageTitleElement);

  headerDiv.appendChild(addFileInput());

  let lineBreak = document.createElement('br');
  document.body.appendChild(lineBreak);

  headerDiv.appendChild(addDownloadButton());
  document.body.appendChild(lineBreak);

  document.body.appendChild(headerDiv);
  document.body.appendChild(lineBreak);
}

function addFileInput() {
  let form = document.createElement('form');
  form.id = 'file';
  form.method = 'post';

  let fileInput = document.createElement('input');
  fileInput.setAttribute('type', 'file');
  fileInput.id = 'fileInput';
  fileInput.addEventListener('change', fileHandling, false);

  let button1 = document.createElement('button');
  button1.id = "uploadButton";
  button1.textContent = "Upload Data";
  button1.type = 'button';

  button1.addEventListener('click', () => {
    tableData = [];
    tableData = [...tempData];
    tempData = [];
    removeRows();
    readData(tableData);
  }, false);

  let button2 = document.createElement('button');
  button2.id = "appendButton";
  button2.textContent = "Append Data";
  button2.type = 'button';

  button2.addEventListener('click', () => {
    tableData.push(...tempData);
    tempData = [];
    removeRows();
    readData(tableData);
  }, false);

  form.appendChild(fileInput);
  form.appendChild(button1);
  form.appendChild(button2);

  return form;
}


function createTableElement() {
  let table = document.createElement('table');
  table.id = 'table';
  let tableBody = document.createElement('tbody');
  tableBody.id = 'tableBody';
  table.appendChild(tableBody);
  document.body.appendChild(table);
}

function addDownloadButton() {
  let button = document.createElement('button');
  button.textContent = "Download Data as JSON";
  button.type = 'button';
  button.id = 'downloadButton';
  button.addEventListener('click', downloadDataAsJSON, false);
  return button;
}

function downloadDataAsJSON() {
  if (tableData.length === 0) {
    alert("Add some data first!!!!");
  }
  else {
    let anchor = document.createElement('a');
    let dataStr = "data:text/json;charset=utf-8,"
      + encodeURIComponent(JSON.stringify(tableData));
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "data.json");
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

// function createRowForm(columnName) {
//   let lineBreak = document.createElement('br');
//   document.body.appendChild(lineBreak);

//   let rowForm = document.createElement('input');
//   rowForm.method = 'post';
//   rowForm.id = "rowForm";

//   for (let i = 0; i < columnName.length; i++) {
//     let tempInput = document.createElement('input');
//     tempInput.type = 'text';
//     tempInput.id = columnName[i];
//     tempInput.name = columnName[i];
//     tempInput.placeholder = columnName[i];
//     rowForm.appendChild(tempInput);
//   }

//   let button = document.createElement('button');
//   button.textContent = 'Update';
//   button.type = 'submit';

//   rowForm.appendChild(button);

//   document.body.appendChild(rowForm);
// }

function createTableHeader(headerConfig) {
  let tBody = document.getElementById('tableBody');
  tBody.appendChild(createRow(headerConfig, 0, true));
}

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

function createRow(rowElements, dataId, headerFlag = false) {
  let row = document.createElement('tr');
  for (let i = 0; i < rowElements.length; i++) {
    row.appendChild(createColumn(rowElements[i], headerFlag));
  }
  if (!headerFlag) {
    let btnColumn = document.createElement('td');
    let button = document.createElement('button');
    button.textContent = 'Delete';
    button.type = 'button';
    button.addEventListener('click', () => {
      deleteRow(dataId);
    }, false);
    btnColumn.appendChild(button);
    row.appendChild(btnColumn);
  }
  if (headerFlag) {
    let btnColumn = document.createElement('th');
    let columnText = document.createTextNode("Delete");
    btnColumn.appendChild(columnText);
    row.appendChild(btnColumn);
  }
  return row;
}

function deleteRow(dataId) {
  tableData.splice(dataId, 1);
  replaceTableData();
}

function replaceTableData() {
  removeRows();
  parseData(tableData, tableColumnKey);
}

function removeRows() {
  var table = document.getElementById('table');
  rowCount = table.rows.length;
  for (let x = rowCount - 1; x > 0; x--) {
    table.deleteRow(x);
  }
}

function createColumn(columnElement, headerFlag) {
  let column;
  if (headerFlag) {
    column = document.createElement('th');
  }
  else {
    column = document.createElement('td');
  }
  let columnText = document.createTextNode(columnElement);
  column.appendChild(columnText);
  return column;
}

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

function readData(tableData) {
  parseData(tableData, tableColumnKey);
}

function parseData(tableData, columnKey) {
  for (let i = 0; i < tableData.length; i++) {
    createRowFromData(tableData[i], columnKey, i);
  }
}

function createRowFromData(tableRowData, columnKey, dataId) {
  let rowData = [];
  for (i = 0; i < columnKey.length; i++) {
    rowData.push(parseColumnData(tableRowData, columnKey[i]));
  }

  let tBody = document.getElementById('tableBody');
  tBody.appendChild(createRow(rowData, dataId));
}

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

createHTMLPage();
