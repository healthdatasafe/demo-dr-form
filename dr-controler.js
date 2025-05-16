import { drLib } from './dr-lib.js';
import { exportXLSFile } from './exporToXLS.js';

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
    document.getElementById('please-login').style.display = 'none';
    document.getElementById('data-view').style.display = 'block';
    setQuestionnaries();

  } else {
    document.getElementById('please-login').style.display = 'block';
    document.getElementById('data-view').style.display = 'none';
  }
}

const questionnaryButtons = {};
async function setQuestionnaries() {
  // -- on load
  const selectedQuestionnary = getQuestionnaryFromUrl();
  

  const tbody = document.getElementById('questionnary-table').getElementsByTagName('tbody')[0];
  // clear previous content
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  const quests = await drLib.getQuestionnaires();
  for (const [key, value] of Object.entries(quests)) {
    const row = tbody.insertRow(-1);
    const cellQuestionnary = row.insertCell(-1);
    cellQuestionnary.innerHTML = `<button type="button" class="btn btn-secondary mb-sm">${value.title}</button>`;
    questionnaryButtons[key] = cellQuestionnary.getElementsByTagName('button')[0];
    cellQuestionnary.onclick = function () {
      showQuestionnary(key);
    };
  };

  if (selectedQuestionnary) {
    showQuestionnary(selectedQuestionnary);
  }
}

// ------- Get Dr's info -------- //
function getQuestionnaryFromUrl() {
  const params = new URLSearchParams(document.location.search);
  const questionaryId = params.get('questionaryId');
  return questionaryId
}

function highlightQuestionnaryButton(questionaryId) {
  for (const [key, button] of Object.entries(questionnaryButtons)) {
    const color =  (questionaryId === key) ? "LightSeaGreen" : 'lightgrey';
    button.style.backgroundColor = color;
  }
}

async function showQuestionnary(questionaryId) {
  highlightQuestionnaryButton(questionaryId);
  console.log('## showQuestionnary', questionaryId);
  if (questionaryId == null) {
    document.getElementById('questionnary-view').style.display = 'none';
    return;
  }

  setSharingLink(questionaryId);
  const {headers, patientsData} = await setPatientList(questionaryId);
  document.getElementById('button-download').onclick = async () => {
    await exportXLSFile(headers, patientsData, 'patients');
  }
  document.getElementById('questionnary-view').style.display = 'block';
}

const rowItems = ['name', 'surname', 'nationality'];
/**
 * Update the patient list
 */
async function setPatientList(questionaryId) {
  const table = document.getElementById('patients-table');
  // clear table
  table.innerHTML = '';
  const fields = drLib.getFirstFormFields(questionaryId);
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
    const page = `dr-patient-view.html?patientApiEndpoint=${patient.apiEndpoint}&questionaryId=${questionaryId}`;
    cellUsername.innerHTML = `<A HREF="${page}">${patient.username}</A>`;
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
async function setSharingLink(questionaryId) {
  const currentPage = window.location.href;
  const posDrHTML = currentPage.indexOf('dr.html');
  const patientURL = currentPage.substring(0, posDrHTML) + 'patient.html';

  const formApiEndpoint = await drLib.getSharingToken(questionaryId);
  const sharingLink = patientURL + '?formApiEndpoint=' + formApiEndpoint;
  const sharingMailBody = 'Hello,\n\nI am sending you a link to fill out a form.\nPlease click on the link below to access the form: \n\n' + sharingLink + '\n\nBest regards,\nYour Doctor';
  const sharingLinkHTML = `<A HREF="mailto:?subject=Invitation&body=${encodeURI(sharingMailBody)}">Send by email</A> - ${sharingLink}`;
  document.getElementById('sharing-link').innerHTML = sharingLinkHTML;
}