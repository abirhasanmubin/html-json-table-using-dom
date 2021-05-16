let colName = [];
let colKey = [];

function createHTMLPage() {
  readConfig();
}

function readConfig() {
  fetch('./../public/data/import/config.json').then(response => {
    response.json().then(data => {
      createPageTitle(data.title);
      createTableElement();
      createTableHeader(data.columns);
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

  let fileInput = document.createElement('input');
  fileInput.setAttribute('type', 'file');
  fileInput.id = 'fileInput';
  fileInput.addEventListener('change', fileHandling, false);

  headerDiv.appendChild(fileInput);

  document.body.appendChild(headerDiv);
  let lineBreak = document.createElement('br');
  document.body.appendChild(lineBreak);
}

function fileHandling() {
  let file = this.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    console.log(reader.result);
  };
  reader.onerror = function () {
    console.log(reader.error);
  };
}

function createTableElement() {
  let table = document.createElement('table');
  table.id = 'table';
  let tableBody = document.createElement('tbody');
  tableBody.id = 'tableBody';
  table.appendChild(tableBody);
  document.body.appendChild(table);
}

function createTableHeader(headerConfig) {
  let { columnName, columnKey } = parseHeaderConfig(headerConfig);
  let tBody = document.getElementById('tableBody');
  tBody.appendChild(createRow(columnName, true));
  colName = columnName;
  colKey = columnKey;
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

function createRow(rowElements, headerFlag = false) {
  let row = document.createElement('tr');
  for (let i = 0; i < rowElements.length; i++) {
    row.appendChild(createColumn(rowElements[i], headerFlag));
  }
  return row;
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

createHTMLPage();
