/**
 * UI management code. 
 * Relies on patientLib for API calls and data management
 * 
 * @param {*} event 
 */

window.onload = (event) => {
  stateChange('loggedOut');
  patientLib.showLoginButton('login-button', stateChange);
  document.getElementById('submit-button').addEventListener("click", submitForm);
};

function stateChange(state) {
  if (state === 'loggedIN') {
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('card-form').style.visibility = 'visible';
    getDoctorInfo();
    updateFormContent();
  } else {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('card-form').style.visibility = 'hidden';
  }
}

// ------- Get Dr's info -------- //
async function getDoctorInfo() {
  const params = new URLSearchParams(document.location.search);
  const formApiEndpoint = params.get('formApiEndpoint');
  if (!formApiEndpoint) {
    alert('No formApiEndpoint found in the URL');
    return;
  }
  await initSharingWithDr(formApiEndpoint);
}


// ------- Form -------- //

/**
 * Take the from content from the definition and actual values and create the HTML
 */
async function updateFormContent() {
  const formData = await patientLib.getFormContent();
  console.log('Form content:', formData);
 
  document.getElementById('inputs-list').innerHTML = ''; // Clear previous content
  for (let i = 0; i < formData.length; i++) {
    const formField = formData[i];
    const fieldId = formField.id;
    const fieldValue = formField.value || '';
    const fieldType = formField.type;
    const fieldLabel = formField.label;
    
    // Create the HTML for the form field
    let fieldHTML = `\n<BR><label for="${fieldId}">${fieldLabel}</label>`;
    if (fieldType === 'text' || fieldType === 'number') {
      fieldHTML += `<input type="${fieldType}" id="${fieldId}" value="${fieldValue}" class="form-control"/>`;
    } else if (fieldType === 'select') {
      fieldHTML += `<select id="${fieldId}">`;
      for (const option of fieldValue) {
        fieldHTML += `<option value="${option.value}">${option.label}</option>`;
      }
      fieldHTML += `</select>`;
    }
    // Append the HTML to the form
    document.getElementById('inputs-list').innerHTML += fieldHTML;
  }
}

/**
 * Submit the form and send the data to the API
 */
async function submitForm() {
  const values = {};
  const formData = await patientLib.getFormContent();
  for (let i = 0; i < formData.length; i++) {
    const field = formData[i];
    const fieldId = field.id;
    const fieldValue = document.getElementById(fieldId).value.trim();
    values[field.id] = fieldValue; // Store the value in the values object
  }
  await patientLib.handleFormSubmit(values);
};