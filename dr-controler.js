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
  const questionaryId = 'demo-dr-forms-questionary-x';
  if (state === 'loggedIN') {
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('data-view').style.visibility = 'visible';
    setSharingLink();
    const {headers, patientsData} = await setPatientList(questionaryId);
    document.getElementById('button-download').onclick = () => {
      exportCSVFile(headers, patientsData, 'patients');
    }

  } else {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('data-view').style.visibility = 'hidden';
  }
}

const rowItems = ['name', 'surname', 'nationality'];
/**
 * Update the patient list
 */
async function setPatientList(questionaryId) {
  const table = document.getElementById('patients-table');
  const fields = drLib.getFields(questionaryId);
  const headers = {
    status: 'Status',
    username: 'Username'
  }
  // --- headers
  const headerRow = table.insertRow(-1);
  const headerStatusCell = document.createElement("TH");
  headerStatusCell.innerHTML = 'Status';
  headerRow.appendChild(headerStatusCell);
  const headerUserCell = document.createElement("TH");
  headerUserCell.innerHTML = 'Username';
  headerRow.appendChild(headerUserCell);
  for (const field of fields) {
    const headerCell = document.createElement("TH");
    const formFieldId = field.streamId + ':' + field.eventType;
    headerCell.innerHTML = field.label;
    headerRow.appendChild(headerCell);
    headers[formFieldId] = field.label;
  }

  // --- patients
  const patients = await drLib.getPatientsList(questionaryId, 100);
  const patientsData = [];
  for (const patient of Object.values(patients)) {
    const row = table.insertRow(-1);
    const cellStatus = row.insertCell(-1);
    cellStatus.innerHTML = patient.status;
    const cellUsername = row.insertCell(-1);
    cellUsername.innerHTML = patient.username;
    const patientData = {
      status: patient.status,
      username: patient.username
    }
    for (const field of fields) {
      const formFieldId = field.streamId + ':' + field.eventType;
      const value = patient.formData[formFieldId]?.value;
      row.insertCell(-1).innerHTML = (value != null) ? value : '';
      patientData[formFieldId] = value;
    }
    patientsData.push(patientData);
  }
  return { headers, patientsData };
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