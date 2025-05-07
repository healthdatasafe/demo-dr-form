import { patientLib } from './patient-lib.js';
/**
 * UI management code. 
 * Relies on patientLib for API calls and data management
 * 
 * @param {*} event 
 */

window.onload = async (event) => {
  const { patientApiEndpoint, questionaryId } = getPatientApiEndpointAndFormId();
  console.log('## patientApiEndpoint:', patientApiEndpoint);
  await connect(patientApiEndpoint, questionaryId);
  // -- navigation
  document.getElementById('nav-profile').onclick = () => {
    document.location.href = 'patient-profile.html' + patientLib.getNavigationQueryParams();
  };
  
  // -- connection
  updateFormContent(questionaryId, 'history');
  document.getElementById('submit-button-history').addEventListener("click", function () { 
    submitForm(questionaryId, 'history'); 
  });
}


// ------- Get Questionnary and endpoint info -------- //
function getPatientApiEndpointAndFormId() {
  const params = new URLSearchParams(document.location.search);
  const patientApiEndpoint = params.get('patientApiEndpoint');
  const questionaryId = params.get('questionaryId');
  if (!patientApiEndpoint) {
    alert('No patientApiEndpoint found in the URL');
    return;
  }
  if (!questionaryId) {
    alert('No questionaryId found in the URL');
    return;
  }
  return { patientApiEndpoint, questionaryId };
}


// ------- Form -------- //

/**
 * Take the from content from the definition and actual values and create the HTML
 */
async function updateFormContent(questionaryId, formKey) {
  const formData = await patientLib.getFormContent(questionaryId, formKey);
  console.log('Form content:', formData);
 
}

/**
 * Submit the form and send the data to the API
 */
async function submitForm(questionaryId, formKey) {
  
};