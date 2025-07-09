import { patientLib } from "./patient-lib.js";
import { navControler } from "./patient-nav-controler.js";
/**
 * UI management code.
 * Relies on patientLib for API calls and data management
 *
 * @param {*} event
 */
let navData;
window.onload = async (event) => {
  // const get formKey
  const formKey = (new URLSearchParams(window.location.search)).get('formKey');
  const appClient = await patientLib.getAppClient();
  const { collectorClientKey } = patientLib.navGetData();
  const collectorClient = await appClient.getCollectorClientByKey(collectorClientKey);

  await navControler.setNavComponents(collectorClient, formKey);

  // form title
  const formTitle = document.getElementById('card-questionnary-details-title');
  const requestData = collectorClient.requestData;
  const title = HDSLib.l(requestData.app.data.forms[formKey].title);
  formTitle.innerHTML = title;

  const dateInput = document.getElementById("form-date");
  dateInput.value = dateToDayStr(new Date()); 
  dateInput.onblur = function () {
    const date = dateInput.valueAsDate;
    console.log("## Blur Out Date", date);
    refreshAll(dateToDayStr(date));
  };

  // set navData
  navData = { appClient, collectorClient, formKey };
  refreshAll(dateToDayStr(dateInput.valueAsDate));
};

function dateToDayStr(date) {
  return date.toISOString().split("T")[0]; // format YYYY-MM-DD
}

// expose refreshAll for date links
window.refreshClick = refreshClick;
function refreshClick(dateStr) {
  const dateInput = document.getElementById("form-date");
  dateInput.value =  dateStr; 
  refreshAll(dateStr);
}

async function refreshAll(dateStr) {
  console.log("## Refresh Form Date:", dateStr);
  const { appClient, collectorClient, formKey } = navData;
  // -- content
  const formData = await patientLib.getFormHistorical(
    collectorClient,
    formKey
  );

  const tableRow = await refreshDataTable(collectorClient, formKey, dateStr);
  console.log('## tableRow', tableRow);

  // HACKY WAY TO ADD EXISTNG CONTENT SHOULD BE DONE IN LIB
  for (const field of formData) {
    if (tableRow[field.id]) {
      field.value = tableRow[field.id].value;
      field.eventId = tableRow[field.id].eventId;
    }
  }

  await updateFormContent(formData);
  document.getElementById("submit-button-list").onclick = function () {
    submitForm(collectorClient, formData, formKey, dateStr);
  };
}

async function refreshDataTable(collectorClient, formKey, currentDateStr) {
  let currentValue = {};
  const tableData = await patientLib.getHistoricalContent(
    collectorClient,
    formKey
  );
  const table = document.getElementById("historical-data");
  table.innerHTML = "";

  // -- headers
  const headerRow = table.insertRow(-1);
  const headerDateCell = document.createElement("TH");
  headerDateCell.innerHTML = "Date";
  headerRow.appendChild(headerDateCell);
  for (const th of tableData.tableHeaders) {
    const headerCell = document.createElement("TH");
    headerCell.innerHTML = th.label;
    headerRow.appendChild(headerCell);
  }
  for (const data of tableData.valuesByDate) {
    const row = table.insertRow(-1);
    if (currentDateStr === data.dateStr) {
      currentValue = data;
      row.style.backgroundColor = '#D3D3D3'; // light grey
    } 


    const cellDate = row.insertCell(-1);
    cellDate.innerHTML = `<A HREF="javascript:refreshClick('${data.dateStr}')">${data.dateStr}</A>`;
    for (const th of tableData.tableHeaders) {
      const cell = row.insertCell(-1);
      const v = data[th.fieldId]?.valueTxt;
      cell.innerHTML = v != null ? v : '' ;
    }
  }

  console.log("## tabledata", tableData);
  return currentValue;
}

// ------- Form -------- //

/**
 * Take the from content from the definition and actual values and create the HTML
 */
async function updateFormContent(formData) {
  console.log("Form content:", formData);

  // Append the HTML to the form
  document.getElementById("inputs-list").innerHTML = ""; // Clear previous content
  for (let i = 0; i < formData.length; i++) {
    const formField = formData[i];
    const fieldId = formField.id;
    const fieldValue = formField.value != null ? `${formField.value}` : '';
    const fieldType = formField.type;
    const fieldLabel = formField.label;

    // Create the HTML for the form field
    let fieldHTML = `\n<BR><label for="${fieldId}">${fieldLabel}</label>`;
    if (fieldType === "text" || fieldType === "number") {
      fieldHTML += `<input type="${fieldType}" id="${fieldId}" value="${fieldValue}" class="form-control"/>`;
    } else if (fieldType === "select") {
      fieldHTML += `<select id="${fieldId}" class="form-control">`;
      fieldHTML += `<option value="">--</option>`;
      for (const option of formField.options) {
        const selected = `${option.value}` === fieldValue ? "selected" : "";
        fieldHTML += `<option value="${option.value}" ${selected}>${option.label.en}</option>`;
      }
      fieldHTML += `</select>`;
    } else if (fieldType === "date") {
      fieldHTML += `<input type="date" id="${fieldId}" value="${fieldValue}" class="form-control"/>`;
    } else if (fieldType === "checkbox") {
      const checkedStr = fieldValue != '' ? 'checked' : '';
      fieldHTML += `<input type="checkbox" id="${fieldId}" class="form-control" ${checkedStr}/>`;
    }

    document.getElementById("inputs-list").innerHTML += fieldHTML;
  }
}

/**
 * Submit the form and send the data to the API
 */
async function submitForm(collectorClient, formData, formKey, dateStr) {
  
  const values = {};
  for (let i = 0; i < formData.length; i++) {
    const field = formData[i];
    const fieldId = field.id;
    const formField = document.getElementById(fieldId);
    // Store the value in the values object
    if (field.type === "date") {
      values[field.id] = formField.valueAsDate;
    } else if (field.type === "checkbox") {
      values[field.id] = formField.checked ? 'true' : '';
    } else {
      values[field.id] = formField.value.trim();
    }
  }
  console.log('## SubmitForm', {formData, values});
  await patientLib.handleFormSubmit(collectorClient, formData, formKey, values, new Date(dateStr));
  alert("Form submitted successfully");
  await refreshAll(dateStr);
}
