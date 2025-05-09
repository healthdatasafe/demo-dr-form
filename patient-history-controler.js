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
  navData = await navControler.setNavComponents();
  console.log("## navData", navData);
  const { patientApiEndpoint, questionaryId, formKey } = navData;
  console.log("## patientApiEndpoint:", patientApiEndpoint);
  await patientLib.connect(patientApiEndpoint, questionaryId);
  // - form title
  const formTitle = document.getElementById("card-questionnary-details-title");
  formTitle.innerHTML = patientLib.getFormTitle(questionaryId);
  const dateInput = document.getElementById("form-date");
  dateInput.value = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
  dateInput.onfocusout = function () {
    const date = dateInput.valueAsDate;
    console.log("## Focus Out Date", date);
    refreshForm(date);
  };

  refreshForm(dateInput.valueAsDate);
  refreshDataTable();
};

async function refreshForm(date) {
  console.log("## Refresh Form Date:", date);
  const { questionaryId, formKey } = navData;
  // -- content
  console.log();
  const formData = await patientLib.getFormContent(
    questionaryId,
    formKey,
    date
  );
  updateFormContent(formData);
  document.getElementById("submit-button-list").onclick = function () {
    submitForm(formData, date);
  };
}

async function refreshDataTable(date) {
  const { questionaryId, formKey } = navData;
  const tableData = await patientLib.getHistoricalContent(
    questionaryId,
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
  for (const [dateStr, data] of Object.entries(tableData.valuesByDate)) {
    const row = table.insertRow(-1);
    const cellDate = row.insertCell(-1);
    cellDate.innerHTML = dateStr;
    for (const th of tableData.tableHeaders) {
      const cell = row.insertCell(-1);
      cell.innerHTML = data[th.fieldId] || '';
    }
  }

  console.log("## tabledata", tableData);
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
    const fieldValue = formField.value != null ? formField.value : "";
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
        const selected = option.value === fieldValue ? "selected" : "";
        fieldHTML += `<option value="${option.value}" ${selected}>${option.label}</option>`;
      }
      fieldHTML += `</select>`;
    } else if (fieldType === "date") {
      fieldHTML += `<input type="date" id="${fieldId}" value="${fieldValue}" class="form-control"/>`;
    }

    document.getElementById("inputs-list").innerHTML += fieldHTML;
  }
}

/**
 * Submit the form and send the data to the API
 */
async function submitForm(formData, date) {
  const values = {};
  for (let i = 0; i < formData.length; i++) {
    const field = formData[i];
    const fieldId = field.id;
    const formField = document.getElementById(fieldId);
    // Store the value in the values object
    if (field.type === "date") {
      values[field.id] = formField.valueAsDate;
    } else {
      values[field.id] = formField.value.trim();
    }
  }
  await patientLib.handleFormSubmit(formData, values, date);
  alert("Form submitted successfully");
}
