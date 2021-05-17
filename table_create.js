let table_config;
let table_data;


// Fetching JSON Data
fetch('./table_config.json')
    .then(response => {
        response.json().then(data => {
            table_config = data;
        });
    });

fetch('./table_data.json')
    .then(response => {
        response.json().then(data => {
            table_data = data;
        });
    });

// Title Creator
function createTitle(titleInfo) {
    let title = document.createElement("h1");
    let titleText = document.createTextNode(titleInfo);
    title.appendChild(titleText);
    return title;
}

// Utility function for parsing Config file
// for column header and value_keys of table_data
function splitConfig(config) {
    let header = [];
    let key = [];
    for (let i = 0; i < config.length; i++) {
        header.push(config[i].header);
        key.push(config[i].cell);
    }
    return { header, key };
}

// Utility function for parsing expected data from table_data
function parseTableDataColumn(object, key) {
    // spliting key for ease of search
    let keys = key.split('.');

    // Safely copying object data
    let tempObject = { ...object };


    for (let i = 0; i < keys.length; i++) {
        if (tempObject.hasOwnProperty(keys[i])) {
            if (typeof tempObject[keys[i]] === "object") {
                tempObject = { ...tempObject[keys[i]] };
            }
            else {
                return tempObject[keys[i]];
            }
        }
        else {
            return null;
        }
    }
}

// parsing for table row data
function parseTableDataRow(object, key) {
    let data = [];
    for (let i = 0; i < key.length; i++) {
        data.push((object, key[i]));
    }
    return data;
}

// Creating Table Column
function createColumn(item, headerFlag) {
    let column;
    if (headerFlag) {
        column = document.createElement("th");
    }
    else {
        column = document.createElement("td");
    }
    let columnText = document.createTextNode(item);
    column.appendChild(columnText);
    return column;
}

// Creating Table Row
function createRow(columnItems, headerFlag) {
    let row = document.createElement('tr');
    for (let i = 0; i < columnItems.length; i++) {
        row.appendChild(createColumn(columnItems[i], headerFlag));
    }
    return row;
}

// Creating Table
function createTable(config, data) {

    //create table and tablebody element
    let table = document.createElement("table");
    let tablebody = document.createElement("tbody");

    // parse config file for creating header
    let results = splitConfig(table_config.columns);
    let columnHeader = results.header;
    let columnKey = results.key;

    //Add header to the table
    tablebody.appendChild(createRow(columnHeader, true));

    // parse data for populating table
    for (let i = 0; i < table_data.length; i++) {
        let data = parseTableDataRow(table_data[i], columnKey);
        tablebody.appendChild(createRow(data, false));
    }

    table.appendChild(tablebody);
    return table;
}

function findData(row) {
    return { ...table_data[row] };
}

function findKeys(colIndex) {
    let key = table_config.columns[colIndex].cell;
    let keys = key.split('.');
    return keys;
}

function getData(data, keys) {
    let tempObject = { ...data };
    for (let i = 0; i < keys.length; i++) {
        if (tempObject.hasOwnProperty(keys[i])) {
            if (typeof tempObject[keys[i]] === "object") {
                tempObject = { ...tempObject[keys[i]] };
            }
            else {
                return tempObject[keys[i]];
            }
        }
        else {
            return null;
        }
    }
}

function addEvent() {
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            let rowIndex = cell.closest('tr').rowIndex;
            let colIndex = cell.cellIndex;
            let data = findData(rowIndex - 1);
            let keys = findKeys(colIndex);
            let value = getData(data, keys);
            document.body.appendChild(createForm(rowIndex, colIndex, value));
        });
    });
}

function createForm(rowIndex, colIndex, data) {
    let form = document.createElement('form');
    form.method = 'post';
    let row = document.createElement('input');
    row.type = 'text';
    row.name = 'Row';
    row.value = rowIndex;
    form.appendChild(row);
    let column = document.createElement('input');
    column.type = 'text';
    column.name = 'Column';
    column.value = colIndex;
    form.appendChild(column);
    let value = document.createElement('input');
    value.type = 'text';
    value.name = 'Value';
    value.value = data;
    form.appendChild(value);
    let button = document.createElement('button');
    button.textContent = 'Update';
    button.type = 'submit';
    // button.value = 'submit';
    button.addEventListener('click', (event) => {
        console.log(event);
    })
    form.appendChild(button);
    return form;
}

function updateData(event) {
    let form = document.querySelector('form');

}

setTimeout(() => {
    document.body.appendChild(createTitle(table_config.title));
    document.title = table_config.title;
    document.body.appendChild(createTable(table_config, table_data));
    addEvent();

}, 100);

