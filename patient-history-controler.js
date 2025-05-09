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
  
  // -- connection
  updateFormContent(questionaryId, 'history');
  document.getElementById('submit-button-history').addEventListener("click", function () { 
    submitForm(questionaryId, 'history'); 
  });
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