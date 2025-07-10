import { patientLib } from './patient-lib.js';
import { navControler } from './patient-nav-controler.js';
import { stateGetApp, stateGetData } from './common-lib.js';

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
  const appClient = await stateGetApp('client');
  const { collectorClientKey } = stateGetData('collector');
  const collectorClient = await appClient.getCollectorClientByKey(collectorClientKey);

  await navControler.setNavComponents(collectorClient, formKey);

  // form title
  const formTitle = document.getElementById('card-questionnary-details-title');
  const requestData = collectorClient.requestData;
  const title = HDSLib.l(requestData.app.data.forms[formKey].title);
  formTitle.innerHTML = title;

  // set navData
  navData = { appClient, collectorClient, formKey };
  refreshForm();
}

async function refreshForm () {
  const { appClient, collectorClient, formKey } = navData;
  // -- content
;  console.log()
  const formData = await patientLib.getFormPermanentContent(collectorClient, formKey)
  updateFormContent(formData);
  document.getElementById('submit-button-list').onclick =  function () { 
    submitForm(collectorClient, formData, formKey); 
  };
}


// ------- Form -------- //

/**
 * Take the from content from the definition and actual values and create the HTML
 */
async function updateFormContent(formData) {
  console.log('### Form content:', formData);
 
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
        fieldHTML += `<option value="${option.value}" ${selected}>${option.label.en}</option>`;
      }
      fieldHTML += `</select>`;
    } else if (fieldType === 'date') {
      fieldHTML += `<input type="date" id="${fieldId}" value="${fieldValue}" class="form-control"/>`;
    }
   
    document.getElementById('inputs-list').innerHTML += fieldHTML;
  }
}

/**
 * Submit the form and send the data to the API
 */
async function submitForm(collectorClient, formData, formKey) {
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
  await patientLib.handleFormSubmit(collectorClient, formData, formKey, values);
  alert('Form submitted successfully');
};