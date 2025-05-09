import { patientLib } from './patient-lib.js';
import { navControler } from './patient-nav-controler.js'
/**
 * UI management code. 
 * Relies on patientLib for API calls and data management
 * 
 * @param {*} event 
 */

window.onload = async (event) => {
  const navData = await navControler.setNavComponents();
  console.log('## navData', navData);
  const { patientApiEndpoint, questionaryId } = navData;
  console.log('## patientApiEndpoint:', patientApiEndpoint);
  await patientLib.connect(patientApiEndpoint, questionaryId);
  // - form title
  const formTitle = document.getElementById('card-questionnary-details-title');
  formTitle.innerHTML = patientLib.getFormTitle(questionaryId);
  // -- content
  updateFormContent(questionaryId, 'profile');
  document.getElementById('submit-button-profile').addEventListener("click", function () { 
    submitForm(questionaryId, 'profile'); 
  });
  
}


// ------- Form -------- //

/**
 * Take the from content from the definition and actual values and create the HTML
 */
async function updateFormContent(questionaryId, formKey) {
  const formData = await patientLib.getFormContent(questionaryId, formKey);
  console.log('Form content:', formData);
 
  document.getElementById('inputs-' + formKey).innerHTML = ''; // Clear previous content
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
    }
    // Append the HTML to the form
    document.getElementById('inputs-' + formKey).innerHTML += fieldHTML;
  }
}

/**
 * Submit the form and send the data to the API
 */
async function submitForm(questionaryId, formKey) {
  const values = {};
  const formData = await patientLib.getFormContent(questionaryId, formKey);
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
  await patientLib.handleFormSubmit(questionaryId, formKey, values);
  alert('Form submitted successfully');
};