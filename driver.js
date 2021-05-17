function createHTMLPage() {
  readConfig();
}

function readConfig() {
  fetch('/config.json').then(response => {
    response.json().then(data => {
      let { columnName, columnKey } = parseHeaderConfig(data.columns);
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

  let fileInput = document.createElement('input');
  fileInput.setAttribute('type', 'file');
  fileInput.id = 'fileInput';
  fileInput.addEventListener('change', fileHandling, false);

  headerDiv.appendChild(fileInput);

  document.body.appendChild(headerDiv);
  let lineBreak = document.createElement('br');
  document.body.appendChild(lineBreak);
}


function createTableElement() {
  let table = document.createElement('table');
  table.id = 'table';
  let tableBody = document.createElement('tbody');
  tableBody.id = 'tableBody';
  table.appendChild(tableBody);
  document.body.appendChild(table);
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
  tBody.appendChild(createRow(headerConfig, true));
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

function fileHandling() {
  let file = this.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    // console.log(reader.result);
    readData(reader.result);
  };
  reader.onerror = function () {
    console.log(reader.error);
  };
}

function readData(tableData) {
  fetch('/config.json').then(response => {
    response.json().then(data => {
      let { columnKey } = parseHeaderConfig(data.columns);
      parseData(tableData, columnKey);
    });
  });
}

function parseData(tableData, columnKey) {
  tableData = JSON.parse(tableData);
  for (let i = 0; i < tableData.length; i++) {
    createRowFromData(tableData[i], columnKey);
  }
}

function createRowFromData(tableRowData, columnKey) {
  let rowData = [];
  for (i = 0; i < columnKey.length; i++) {
    rowData.push(parseColumnData(tableRowData, columnKey[i]));
  }

  let tBody = document.getElementById('tableBody');
  tBody.appendChild(createRow(rowData));
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
