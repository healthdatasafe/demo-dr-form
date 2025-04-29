/**
 * UI management code. 
 * Relies on drLib for API calls and data management
 * Used to seprate the UI from the API calls
 * @param {*} event 
 */

window.onload = (event) => {
  stateChange('loggedOut');
  drLib.showLoginButton('login-button', stateChange);
};

async function stateChange(state) {
  if (state === 'loggedIN') {
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('data-view').style.visibility = 'visible';
    setSharingLink();
    setPatientList();
  } else {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('data-view').style.visibility = 'hidden';
  }
}

const rowItems = ['name', 'surname', 'nationality'];
/**
 * Update the patient list
 */
async function setPatientList() {
  const table = document.getElementById('patients-table');
  const fields = drLib.getFields();
  // --- headers
  const headerRow = table.insertRow(-1);
  const headerUserCell = document.createElement("TH");
  headerUserCell.innerHTML = 'Username';
  headerRow.appendChild(headerUserCell);
  for (const field of fields) {
    const headerCell = document.createElement("TH");
    headerCell.innerHTML = field.label;
    headerRow.appendChild(headerCell);
  }

  // --- patients
  const patients = await drLib.getPatientsList();
  for (const patient of Object.values(patients)) {
    const row = table.insertRow(-1);
    const cellUsername = row.insertCell(-1);
    cellUsername.innerHTML = patient.username;
    for (const field of fields) {
      console.log('## field', field);
      row.insertCell(-1).innerHTML = patient.formData[field.dataFieldKey]?.value || '';
    }
  }
}

/**
 * Creates the sharing link on the page
 */
async function setSharingLink() {
  const currentPage = window.location.href;
  const posDrHTML = currentPage.indexOf('dr.html');
  const patientURL = currentPage.substring(0, posDrHTML) + 'patient.html';

  const formApiEndpoint = await drLib.getSharingToken();
  const sharingLink = patientURL + '?formApiEndpoint=' + formApiEndpoint;
  const sharingMailBody = 'Hello,\n\nI am sending you a link to fill out a form.\nPlease click on the link below to access the form: \n\n' + sharingLink + '\n\nBest regards,\nYour Doctor';
  const sharingLinkHTML = `<A HREF="mailto:?subject=Invitation&body=${encodeURI(sharingMailBody)}">Send by email</A> - ${sharingLink}`;
  document.getElementById('sharing-link').innerHTML = sharingLinkHTML;
}