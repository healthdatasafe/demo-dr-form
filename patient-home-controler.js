import { patientLib } from './patient-lib.js';
import { patientHomeLib } from './patient-home-lib.js';
import { stateGetApp, stateSetData } from './common-lib.js';

/**
 * UI management code. 
 * Relies on patientLib for API calls and data management
 * 
 * @param {*} event 
 */

window.onload = (event) => {
  stateChange('loggedOut');
  patientHomeLib.showLoginButton('login-button', stateChange);
};

function stateChange(state) {
  if (state === 'loggedIN') {
    document.getElementById('please-login').style.display = 'none';
    document.getElementById('card-content').style.display = 'block';
    refresh();
  } else {
    document.getElementById('please-login').style.display = 'block';
    document.getElementById('card-content').style.display = 'none';
  }
}

async function refresh() {
  const inviteParams = getInviteParamsFromURL();
  const appClient = await stateGetApp('client');
  if (inviteParams) {
    const collectorClient = await appClient.handleIncomingRequest(inviteParams.apiEndpoint, inviteParams.eventId);
    console.log('>>## refresh: new incoming request', collectorClient);
  }
  const collectorClients = await appClient.getCollectorClients();
  console.log('>>## refresh: collectorClients', collectorClients);
  showFormList(collectorClients);
  // showFormDetails(null);
}

// ------- Get Dr's info -------- //
function getInviteParamsFromURL() {
  const params = new URLSearchParams(document.location.search);
  const apiEndpoint = params.get('apiEndpoint');
  const eventId = params.get('eventId');
  console.log('>>## getInviteParamsFromURL', { apiEndpoint, eventId });
  if (apiEndpoint == null || eventId == null) return null;
  return { apiEndpoint, eventId };
}

// --------- Update form list --------- //
const questionnaryRows = {};
async function showFormList(collectorClients) {
  console.log('## showFormList', collectorClients);

  // -- table
  const tbody = document.getElementById('questionnary-table').getElementsByTagName('tbody')[0];

  // clear previous content
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  for (const collectorClient of collectorClients) {
    const requestData = collectorClient.requestData;
    // fill the table row
    const row = tbody.insertRow(-1);
    const cellQuestionnary = row.insertCell(-1);
    const formTitle = HDSLib.l(requestData.title);
    cellQuestionnary.innerHTML = `<button type="button" class="btn btn-secondary mb-sm">${formTitle}</button>`;
    questionnaryRows[collectorClient.key] = {
      row, button: cellQuestionnary.getElementsByTagName('button')[0]
    }
    cellQuestionnary.onclick = function () {
      showFormDetails(collectorClient);
    };

    const cellDr = row.insertCell(-1);
    cellDr.innerHTML = requestData.requester.name;

    const cellStatus = row.insertCell(-1);
    cellStatus.innerHTML = collectorClient.status;
  }
}

function highlightQuestionnaryButton(buttonKey) {
  for (const [key, entry] of Object.entries(questionnaryRows)) {
    const colorButton =  (buttonKey === key) ? "LightSeaGreen" : 'lightgrey';
    const colorRow =  (buttonKey === key) ? 'lightgrey' : '';
    entry.button.style.backgroundColor = colorButton;
    entry.row.style.backgroundColor = colorRow;
  }
}

// ----------- Show form details ----------- //
async function showFormDetails(collectorClient) {
  highlightQuestionnaryButton(collectorClient.key);
  const show = !!collectorClient;
  document.getElementById('card-questionnary-details-nothing').style.display = show ? 'none' : 'block';
  document.getElementById('card-questionnary-details-something').style.display= show ? 'block' : 'none';
  // clear navData
  stateSetData(null, 'collector');
  if (!show) return;
  const requestData = collectorClient.requestData;
  console.log('## showFormDetails', requestData);

  // - form title
  const formTitle = document.getElementById('card-questionnary-details-title');
  formTitle.innerHTML = HDSLib.l(requestData.title);

  // - description
  const formDesc = document.getElementById('card-questionnary-details-description')
  formDesc.innerHTML = HDSLib.l(requestData.description);

  // - consent 
  const formConsent = document.getElementById('questionnary-details-consent')
  formConsent.innerHTML = HDSLib.l(requestData.consent);

  // - permissions
  const tbody = document.getElementById('access-request').getElementsByTagName('tbody')[0];;

  // clear previous content
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  for (const permission of requestData.permissions) {
    const row = tbody.insertRow(-1);
    const cellStream = row.insertCell(-1);
    cellStream.innerHTML = permission.defaultName;
    const cellLevel = row.insertCell(-1);
    cellLevel.innerHTML = permission.level;
  }
  // - grant access / open
  const buttonOpen = document.getElementById('grant-access-button');
  const buttonRevoke = document.getElementById('revoke-access-button');

  // -- pass the current collector to the next page
  stateSetData({ collectorClientKey: collectorClient.key }, 'collector');

  const nextPage = (await patientLib.navGetPages(collectorClient))[1].url;
  console.log('## detail ', collectorClient, collectorClient.status);
  if (collectorClient.status === 'Active') {
    buttonOpen.innerHTML = 'Open';
    buttonOpen.onclick = async function () {
      document.location.href = nextPage;
    };
    buttonRevoke.innerHTML = 'Revoke';
    buttonRevoke.onclick = async function () {
      const doRevoke = confirm('Revoke ?');
      if (doRevoke) patientHomeLib.revokeAccess(collectorClient);
      refresh();
    };
  }
  else {
    buttonOpen.innerHTML = 'Grant access and Open';
    buttonOpen.onclick = async function () {
      await collectorClient.accept();
      document.location.href = nextPage;
    };
    buttonRevoke.innerHTML = 'Refuse';
    buttonRevoke.onclick = async function () {
      const doRevoke = confirm('Refuse ?');
      if (doRevoke) patientHomeLib.revokeAccess(requestData);
      refresh();
    }
  }

  // - json
  // const jsonContent = document.getElementById('card-questionnary-details-content');
  // jsonContent.innerHTML = '<pre>' + JSON.stringify(formInfo.formEvent, null, 2) + '<pre>';
}