var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
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
var storage = window.localStorage;
var tableColumnName = [];
var tableColumnKey = [];
var tableData = [];
var tempData = [];
var sortingDirection = [];
function createHTMLPage() {
    fetch('config.json').then(function (response) {
        response.json().then(function (data) {
            var _a = parseHeaderConfig(data.columns), columnName = _a.columnName, columnKey = _a.columnKey;
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
        });
    });
}
function fillSortingDirection(arrLength) {
    for (var i = 0; i < arrLength; i++) {
        sortingDirection.push(true);
    }
}
function parseHeaderConfig(headerConfig) {
    var columnName = [];
    var columnKey = [];
    for (var i = 0; i < headerConfig.length; i++) {
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
                var keys = headerConfig[i].cell;
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
    return { columnKey: columnKey, columnName: columnName };
}
function createPageHeader(titleText) {
    var headerDiv = document.createElement('div');
    headerDiv.id = "header";
    var pageTitleElement = document.createElement('h1');
    pageTitleElement.id = "pageTitle";
    var pageTitleText = document.createTextNode(titleText);
    pageTitleElement.appendChild(pageTitleText);
    headerDiv.appendChild(pageTitleElement);
    // adding file upload option
    headerDiv.appendChild(addFileInput());
    var lineBreak = document.createElement('br');
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
function addFileInput() {
    var form = document.createElement('form');
    form.id = 'file';
    form.method = 'post';
    var fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.id = 'fileInput';
    fileInput.addEventListener('change', fileHandling, false);
    var uploadButton = document.createElement('button');
    uploadButton.id = "uploadButton";
    uploadButton.textContent = "Upload Data";
    uploadButton.type = 'button';
    uploadButton.addEventListener('click', function () {
        if (fileInput.files.length !== 0) {
            // resetting data
            tableData = [];
            // storing data
            tableData = __spreadArray([], tempData);
            tempData = [];
            // Loading new data
            refreshLocalTableData();
            form.reset();
        }
    }, false);
    var appendButton = document.createElement('button');
    appendButton.id = "appendButton";
    appendButton.textContent = "Append Data";
    appendButton.type = 'button';
    appendButton.addEventListener('click', function () {
        if (fileInput.files.length !== 0) {
            // appending data to stored data
            tableData.push.apply(tableData, tempData);
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
function fileHandling() {
    var file = this.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
        var fData = JSON.parse(reader.result);
        tempData = fData.slice();
    };
    reader.onerror = function () {
        console.log(reader.error);
    };
}
function getLocalTableData() {
    return JSON.parse(storage.getItem('tabledata'));
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
    var table = document.getElementById('table');
    var rowCount = table.rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}
function parseData(tableData, columnKey) {
    for (var i = 0; i < tableData.length; i++) {
        createRowFromData(tableData[i], columnKey, i);
    }
}
function createRowFromData(tableRowData, columnKey, dataId) {
    var rowData = [];
    // Parsing data
    for (var i = 0; i < columnKey.length; i++) {
        rowData.push(parseColumnData(tableRowData, columnKey[i]));
    }
    // generating table row
    var tBody = document.getElementById('tableBody');
    tBody.appendChild(createRow(rowData, dataId));
}
function parseColumnData(object, key) {
    var tempObject = __assign({}, object);
    for (var i = 0; i < key.length; i++) {
        if (tempObject.hasOwnProperty(key[i])) {
            if (typeof tempObject[key[i]] === "object") {
                tempObject = __assign({}, tempObject[key[i]]);
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
function createRow(rowElements, dataId, headerFlag) {
    if (headerFlag === void 0) { headerFlag = false; }
    var row = document.createElement('tr');
    for (var i = 0; i < rowElements.length; i++) {
        row.appendChild(createColumn(rowElements[i], dataId, headerFlag));
    }
    if (!headerFlag) {
        // Added Edit option for table cell and delete for table row
        var btnColumn = document.createElement('td');
        var button = document.createElement('button');
        button.textContent = 'Delete';
        button.type = 'button';
        button.addEventListener('click', function () {
            deleteTableRow(dataId);
        }, false);
        btnColumn.appendChild(button);
        row.appendChild(btnColumn);
    }
    else {
        var actionColumn = document.createElement('th');
        var actionText = document.createTextNode("Action");
        actionColumn.appendChild(actionText);
        row.appendChild(actionColumn);
    }
    return row;
}
function deleteTableRow(dataId) {
    tableData.splice(dataId, 1);
    refreshLocalTableData();
}
function createColumn(columnElement, rowIndex, headerFlag) {
    var column;
    if (headerFlag) {
        column = document.createElement('th');
    }
    else {
        column = document.createElement('td');
    }
    var columnText = document.createTextNode(columnElement);
    column.style.cursor = "pointer";
    column.appendChild(columnText);
    if (!headerFlag) {
        column.contentEditable = "true";
        // column.contentEditable = true;
        column.addEventListener('input', function (event) {
            event.preventDefault();
            var columnIndex = column.cellIndex;
            var value = document.getElementById('table')
                .rows[rowIndex + 1].cells[columnIndex].textContent;
            updateValue(rowIndex, columnIndex, value);
        });
    }
    else {
        // Sorting event for table header
        column.addEventListener('click', function () {
            var columnIndex = column.cellIndex;
            sortTable(columnIndex);
        });
    }
    return column;
}
function updateValue(rowIndex, columnIndex, value) {
    var data = tableData[rowIndex];
    var keys = tableColumnKey[columnIndex];
    for (var i = 0; i < keys.length; i++) {
        if (typeof data[keys[i]] === "object") {
            data = data[keys[i]];
        }
        else {
            data[keys[i]] = value;
        }
    }
}
function addDownloadButton() {
    var button = document.createElement('button');
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
        var anchor = document.createElement('a');
        var dataStr = "data:text/json;charset=utf-8,"
            + encodeURIComponent(JSON.stringify(tableData));
        anchor.href = dataStr;
        anchor.download = "data.json";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    }
}
function addTableSearch() {
    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'search';
    input.placeholder = 'Search Here';
    input.contentEditable = "true";
    input.addEventListener('input', searchResult, false);
    return input;
}
function searchResult() {
    var input = document.getElementById('search');
    var searchText = input.value.toLowerCase();
    var table = document.getElementById("table");
    var tableRows = table.getElementsByTagName("tr");
    for (var i = 1; i < tableRows.length; i++) {
        var tableColumns = tableRows[i].getElementsByTagName("td");
        var searchFlag = false;
        for (var j = 0; j < tableColumns.length; j++) {
            var cell = tableColumns[j];
            var textValue = cell.textContent;
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
    var table = document.createElement('table');
    table.id = 'table';
    var tableBody = document.createElement('tbody');
    tableBody.id = 'tableBody';
    table.appendChild(tableBody);
    document.body.appendChild(table);
}
function createRowForm() {
    var lineBreak = document.createElement('br');
    document.body.appendChild(lineBreak);
    var rowForm = document.createElement('form');
    rowForm.method = 'post';
    rowForm.id = "rowForm";
    for (var i = 0; i < tableColumnName.length; i++) {
        var tempInput = document.createElement('input');
        tempInput.type = 'text';
        tempInput.id = tableColumnName[i];
        tempInput.name = tableColumnName[i];
        tempInput.placeholder = tableColumnName[i];
        tempInput.required = true;
        rowForm.appendChild(tempInput);
    }
    var button = document.createElement('button');
    button.textContent = 'Add Data';
    button.type = 'submit';
    rowForm.appendChild(button);
    rowForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var object = {};
        // Processing data
        for (var i = 0; i < tableColumnKey.length; i++) {
            var data = event.target;
            createDataObject(object, tableColumnKey[i], event.target[i].value);
        }
        // Adding data
        tableData.push(object);
        refreshLocalTableData();
        rowForm.reset();
    }, false);
    document.body.appendChild(rowForm);
}
function createDataObject(obj, keyPath, value) {
    var lastKeyIndex = keyPath.length - 1;
    for (var i = 0; i < lastKeyIndex; ++i) {
        var key = keyPath[i];
        if (!(key in obj)) {
            obj[key] = {};
        }
        obj = obj[key];
    }
    obj[keyPath[lastKeyIndex]] = value;
}
function createTableHeader() {
    var tBody = document.getElementById('tableBody');
    tBody.appendChild(createRow(tableColumnName, 0, true));
}
function sortTable(index) {
    var direction = sortingDirection[index];
    sortingDirection[index] = !direction;
    var tBody = document.getElementById('tableBody');
    var tableRows = tBody.querySelectorAll('tr');
    //@ts-ignore
    var sortedRows = Array.from(tableRows);
    sortedRows.sort(function (rowA, rowB) {
        if (rowA.querySelectorAll('th').length > 0) {
            return -1;
        }
        else if (rowB.querySelectorAll('th').length > 0) {
            return 1;
        }
        var cellA = rowA.querySelectorAll('td')[index].textContent.toLowerCase();
        var cellB = rowB.querySelectorAll('td')[index].textContent.toLowerCase();
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
    });
    removeRows();
    for (var i = 1; i < sortedRows.length; i++) {
        tBody.appendChild(sortedRows[i]);
    }
}
createHTMLPage();
