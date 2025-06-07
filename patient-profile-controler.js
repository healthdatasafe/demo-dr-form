import { patientLib } from './patient-lib.js';
import { navControler } from './patient-nav-controler.js'
/**
 * UI management code. 
 * Relies on patientLib for API calls and data management
 * 
 * @param {*} event 
 */

let navData;
window.onload = async (event) => {
  navData = await navControler.setNavComponents();
  console.log('## navData', navData);
  const { patientApiEndpoint, questionaryId, formKey } = navData;
  console.log('## patientApiEndpoint:', patientApiEndpoint);
  await patientLib.connect(patientApiEndpoint, questionaryId);
  // - form title
  const formTitle = document.getElementById('card-questionnary-details-title');
  formTitle.innerHTML = patientLib.getFormTitle(questionaryId);
  refreshForm();
}

async function refreshForm () {
  const { questionaryId, formKey } = navData;
  // -- content
;  console.log()
  const formData = await patientLib.getFormContent(questionaryId, formKey)
  updateFormContent(formData);
  document.getElementById('submit-button-list').onclick =  function () { 
    submitForm(formData); 
  };
}


// ------- Form -------- //

/**
 * Take the form content from the definition and actual values and create the HTML
 */
async function updateFormContent(formData) {
  console.log('Form content:', formData);
 
  // Append the HTML to the form
  document.getElementById('inputs-list').innerHTML = ''; // Clear previous content
  for (let i = 0; i < formData.length; i++) {
    const formField = formData[i];
    const fieldId = formField.id;
    const fieldValue = (formField.value != null) ? formField.value : '';
    const fieldType = formField.type;
    const fieldLabel = formField.label;
    
    // Create the HTML for the form field
    let fieldHTML = `\n<BR><label for="${fieldId}">${fieldLabel}</label>`;
    if (fieldType === 'text' || fieldType === 'number') {
      fieldHTML += `<input type="${fieldType}" id="${fieldId}" value="${fieldValue}" class="form-control"/>`;
    } else if (fieldType === 'select') {
      fieldHTML += `<select id="${fieldId}" class="form-control">`;
      fieldHTML += `<option value="">--</option>`;
      for (const option of formField.options) {
        const selected = (option.value === fieldValue) ? 'selected' : '';
        fieldHTML += `<option value="${option.value}" ${selected}>${option.label}</option>`;
      }
      fieldHTML += `</select>`;
    } else if (fieldType === 'date') {
      fieldHTML += `<input type="date" id="${fieldId}" value="${fieldValue}" class="form-control"/>`;
    } else if (fieldType === "checkbox") {
      const checkedStr = fieldValue != '' ? 'checked' : '';
      fieldHTML += `<input type="checkbox" id="${fieldId}" class="form-control" ${checkedStr}/>`;
    } else if (fieldType === "section") {
      fieldHTML += `<h3 class="card-title">${fieldLabel}</h3>`;
    } else if (fieldType === "total") {
      const sectionTotal = formData.filter(
        (x) => (x.section === formField.section && x.type === "checkbox" && x.formField.value != null)
      ).reduce(
        (acc, cur) => acc + curr.multiplier,
        0
      );
      fieldHTML += `<h3 class="card-title">${fieldLabel}: ${sectionTotal}</h3>`;
    }

    document.getElementById('inputs-list').innerHTML += fieldHTML;
  }
}

/**
 * Submit the form and send the data to the API
 */
async function submitForm(formData) {
  const values = {};
  for (let i = 0; i < formData.length; i++) {
    const field = formData[i];
    const fieldId = field.id;
    const formField = document.getElementById(fieldId);
    // Store the value in the values object
    if (field.type === 'date') {
      values[field.id] = formField.valueAsDate; 
    } else {
      values[field.id] = formField.value.trim(); 
    }    
  }
  await patientLib.handleFormSubmit(formData, values);
  alert('Form submitted successfully');
};