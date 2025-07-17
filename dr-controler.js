import { stateGetApp } from './common-lib.js';
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
  await HDSLib.initHDSModel();
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

  const appManaging = await stateGetApp('managing');

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
  const questionaryId = params.get('collectorId');
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
  console.log('## showQuestionnaryId', questionaryId);
  if (questionaryId == null) {
    document.getElementById('questionnary-view').style.display = 'none';
    return;
  }

  const appManaging = await stateGetApp('managing');
  // get questionnary (Controller) 
  const collector = await appManaging.getCollectorById(questionaryId);
  await collector.init(); // load controller data only when needed
  // show details
  const status = collector.statusData;
  
  document.getElementById('request-title').innerHTML = HDSLib.l(status.requestContent.title);
  document.getElementById('request-requester').innerHTML = status.requestContent.requester.name;
  document.getElementById('request-description').innerHTML = HDSLib.l(status.requestContent.description);
  document.getElementById('request-consent').innerHTML = HDSLib.l(status.requestContent.consent);
  const permissionsStr = status.requestContent.permissions.map(p =>  `- ${p.defaultName} => ${p.level}`).join('<BR>\n');
  document.getElementById('request-permissions').innerHTML = permissionsStr;
  document.getElementById('request-app-id').innerHTML = status.requestContent.app.id;
  document.getElementById('request-app-url').innerHTML = status.requestContent.app.url;
  
  // document.getElementById('requestContent').innerHTML = JSON.stringify(status, null, 2);
  // forms sections
  const table = document.getElementById('forms-sections');
  table.innerHTML = '';
  const keyTitles = { type: 'Type', name: 'Name', itemKeys: 'ItemKeys'};
  
  const forms = Object.values(status.requestContent.app.data.forms);
  console.log('## forms', forms);
  for (const [key, title] of Object.entries(keyTitles)) {
    const row = table.insertRow(-1);
    row.insertCell(-1).innerHTML = title;
    for (const form of forms) {
      let content = form[key];
      if (key === 'itemKeys') {
        content = content.map((itemKey) => {
          const itemDef = HDSLib.model.itemsDefs.forKey(itemKey);
          return '- ' + itemDef.label;
        }).join('\n<br>');
      }
      row.insertCell(-1).innerHTML = content;
    }
  }  
  
  console.log('## showQuestionnary status:', status);

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

  // show current patients 
  const {headers, patientsData} = await refreshPatientList(collector);

  //const {headers, patientsData} = await refreshPatientList(questionaryId);
  document.getElementById('button-download').onclick = async () => {
    await exportXLSFile(headers, patientsData, 'patients');
  }
  document.getElementById('questionnary-view').style.display = 'block';
}

async function refreshInviteList(collector) {
   // check inbox for new incoming accepted requests
  const newCollectorInvites = await collector.checkInbox();

  console.log('## refreshInviteList inbox ', newCollectorInvites);

  const table = document.getElementById('invites-table');
  // clear table
  table.innerHTML = '';

  // get all invites
  const invites = await collector.getInvites(); // Todo add a "filter by" maybe only list "Pending" invites
  console.log('## refreshInviteList invites ', invites);
  const pendingInvites = invites.filter(i => i.status === 'pending');
  pendingInvites.sort((a, b) => b.dateCreation - a.dateCreation); // sort by creation date reverse

  console.log('## refreshInviteList pending ', pendingInvites);

  for (const invite of pendingInvites) { 
    const row = table.insertRow(-1);
    row.insertCell(-1).innerHTML = invite.displayName;
    row.insertCell(-1).innerHTML = invite.status;
    row.insertCell(-1).innerHTML = invite.dateCreation.toLocaleString();
    const inviteSharingData = await invite.getSharingData();
    row.insertCell(-1).innerHTML = getSharingLinkHTML(inviteSharingData);
  }

}

/**
 * Update the patient list
 */
async function refreshPatientList(collector) {
  const { headers, patientsData } = await drLib.getPatientsData(collector);

  const table = document.getElementById('patients-table');

  const requestContent = collector.statusData.requestContent;
  console.log('## collector requestContent', requestContent);

  // clear table
  table.innerHTML = '';
  // --- headers
  const headerRow = table.insertRow(-1);
  for (const [key, value] of Object.entries(headers)) {
    const headerCell = document.createElement("TH");
    headerCell.innerHTML = value;
    headerRow.appendChild(headerCell);
  }

  // --- patients

  for (const patient of patientsData) {
    const row = table.insertRow(-1);
   
    for (const key of Object.keys(headers)) {
      let text = patient[key];
      if (key === 'inviteName') { // for inviteName add a link
        const page = `dr-patient-view.html?collectorId=${collector.id}&inviteKey=${patient.invite.key}`;
        text = `<A HREF="${page}">${patient.inviteName}</A>`;
      }
      row.insertCell(-1).innerHTML = text;
    }

  }
  // return this to be used by Excel Download
  return { headers, patientsData };
}

/**
 * Creates the sharing link on the page
 */
function getSharingLinkHTML(inviteSharingData) {
  const currentPage = window.location.href;
  const posDrHTML = currentPage.indexOf('dr.html');
  const patientURL = currentPage.substring(0, posDrHTML) + 'patient.html';
  const sharingLink = `${patientURL}?apiEndpoint=${inviteSharingData.apiEndpoint}&eventId=${inviteSharingData.eventId}`;
  const sharingMailBody = 'Hello,\n\nI am sending you a link to fill out a form.\nPlease click on the link below to access the form: \n\n' + sharingLink + '\n\nBest regards,\nYour Doctor';
  let sharingLinkHTML = `<A HREF="mailto:?subject=Invitation&body=${encodeURIComponent(sharingMailBody)}">Send by email</A>`;
  // add copy link
  sharingLinkHTML += ` - <A HREF="#" onclick="navigator.clipboard.writeText('${sharingLink}'); alert('Copied the sharing link to clipboard')">Copy link to clipboard</A>`;
  return sharingLinkHTML;
}