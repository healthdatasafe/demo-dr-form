import { drLib } from './dr-lib2.js';
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

  const appManaging = drLib.getAppManaging();

  const collectors = await appManaging.getCollectors();
  for (const collector of collectors) {
    const row = tbody.insertRow(-1);
    const cellQuestionnary = row.insertCell(-1);
    cellQuestionnary.innerHTML = `<button type="button" class="btn btn-secondary mb-sm">${collector.name}</button>`;
    questionnaryButtons[collector.id] = cellQuestionnary.getElementsByTagName('button')[0];
    cellQuestionnary.onclick = function () {
      showQuestionnary(collector.id);
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

  const appManaging = drLib.getAppManaging();
  // get questionnary (Controller) 
  const collector = await appManaging.getCollectorById(questionaryId);
  await collector.init(); // load controller data only when needed
  // show details
  const status = collector.statusData;
  document.getElementById('requestContent').innerHTML = JSON.stringify(status, null, 2);
  console.log('## showQuestionnary', status);

  // set create sharing button
  document.getElementById('button-new-sharing').onclick = async () => {
    const title = document.getElementById('title-new-sharing').value.trim();
    if (title.length < 5){
      alert('Sharing title too short (4 char min)');
      return;
    }
    const options = { customData: { hello: 'bob' } }; // useless for now kept as reference, usage could be to pass userId in an other system
    const invite = await collector.createInvite(title, options);
    const inviteSharingData = await invite.getSharingData();
    console.log('## createInvite newInvite and sharing', { invite, inviteSharingData });
    refreshInviteList(collector);
  }

  // show current pending invitations
  await refreshInviteList(collector);

  //const {headers, patientsData} = await setPatientList(questionaryId);
  document.getElementById('button-download').onclick = async () => {
    await exportXLSFile(headers, patientsData, 'patients');
  }
  document.getElementById('questionnary-view').style.display = 'block';
}

async function refreshInviteList(collector) {
  const table = document.getElementById('invites-table');
  // clear table
  table.innerHTML = '';

  // get all invites
  const invites = await collector.getInvites();
  invites.sort((a, b) => b.dateCreation - a.dateCreation); // sort by creation date reverse

  for (const invite of invites) {
    const inviteSharingData = await invite.getSharingData();
    const row = table.insertRow(-1);
    row.insertCell(-1).innerHTML = invite.displayName;
    row.insertCell(-1).innerHTML = invite.status;
    row.insertCell(-1).innerHTML = invite.dateCreation.toLocaleString();
    row.insertCell(-1).innerHTML = getSharingLinkHTML(inviteSharingData);
  }

}

/**
 * Update the patient list
 */
async function setPatientList(questionaryId) {
  const table = document.getElementById('patients-table');
  // clear table
  table.innerHTML = '';
  const itemDefs = drLib.getFirstFormFields(questionaryId);
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
  for (const itemDef of itemDefs) {
    const headerCell = document.createElement("TH");
    headerCell.innerHTML = itemDef.data.label.en;
    headerRow.appendChild(headerCell);
    headers[itemDef.key] = itemDef.data.label.en;
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
    for (const itemDef of itemDefs) {
      const value = patient.formData[itemDef.key]?.value;
      row.insertCell(-1).innerHTML = (value != null) ? value : '';
      patientData[itemDef.key] = value;
    }
    patientsData.push(patientData);
  }
  return { headers, patientsData };
}

/**
 * Creates the sharing link on the page
 */
function getSharingLinkHTML(inviteSharingData) {
  const currentPage = window.location.href;
  const posDrHTML = currentPage.indexOf('dr2.html');
  const patientURL = currentPage.substring(0, posDrHTML) + 'patient2.html';
  const sharingLink = `${patientURL}?apiEndpoint=${inviteSharingData.apiEndpoint}&eventId=${inviteSharingData.eventId}`;
  const sharingMailBody = 'Hello,\n\nI am sending you a link to fill out a form.\nPlease click on the link below to access the form: \n\n' + sharingLink + '\n\nBest regards,\nYour Doctor';
  let sharingLinkHTML = `<A HREF="mailto:?subject=Invitation&body=${encodeURIComponent(sharingMailBody)}">Send by email</A>`;
  // add copy link
  sharingLinkHTML += ` - <A HREF="#" onclick="navigator.clipboard.writeText('${sharingLink}'); alert('Copied the sharing link to clipboard')">Copy link to clipboard</A>`;
  return sharingLinkHTML;
}