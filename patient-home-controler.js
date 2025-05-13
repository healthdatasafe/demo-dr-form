import { patientLib } from './patient-lib.js';
import { patientHomeLib } from './patient-home-lib.js';

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
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('card-content').style.visibility = 'visible';
    refresh();
  } else {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('card-content').style.visibility = 'hidden';
  }
}

async function refresh() {
  const formApiEndpoint = getRequestFrormApiEndPoint();
  console.log('## formApiEndpoint:', formApiEndpoint);
  const formsInfo = await patientHomeLib.getForms(formApiEndpoint);
  showFormList(formsInfo);
  showFormDetails(null);
}

// ------- Get Dr's info -------- //
function getRequestFrormApiEndPoint() {
  const params = new URLSearchParams(document.location.search);
  const formApiEndpoint = params.get('formApiEndpoint');
  return formApiEndpoint || null;
}

// --------- Update form list --------- //
async function showFormList(formsInfo) {
  console.log('## showFormList', formsInfo);

  // -- table
  const tbody = document.getElementById('questionnary-table').getElementsByTagName('tbody')[0];;

  // clear previous content
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  for (const formInfo of formsInfo) {
    // fill the table row
    const row = tbody.insertRow(-1);
    const cellQuestionnary = row.insertCell(-1);
    const formTitle = patientLib.getFormTitle(formInfo.questionaryId);
    cellQuestionnary.innerHTML = `<button type="button" class="btn btn-secondary mb-sm">${formTitle}</button>`;
    cellQuestionnary.onclick = function () {
      showFormDetails(formInfo);
    };

    const cellDr = row.insertCell(-1);
    cellDr.innerHTML = formInfo.drUserId;

    const cellStatus = row.insertCell(-1);
    cellStatus.innerHTML = formInfo.statusLabel;
  }
}

// ----------- Show form details ----------- //
async function showFormDetails(formInfo) {
  const show = !!formInfo;
  document.getElementById('card-questionnary-details-nothing').style.display = show ? 'none' : 'block';
  document.getElementById('card-questionnary-details-something').style.display= show ? 'block' : 'none';
  // clear navData
  patientLib.navSetData(null);
  console.log("## nav get data", patientLib.navGetData());
  if (!show) return;
  const formDetails = await patientHomeLib.getQuestionnaryDetails(formInfo);
  console.log('## showFormDetails', formDetails);

  // - form title
  const formTitle = document.getElementById('card-questionnary-details-title');
  formTitle.innerHTML = patientLib.getFormTitle(formInfo.questionaryId);

  // - permissions
  const tbody = document.getElementById('access-request').getElementsByTagName('tbody')[0];;

  // clear previous content
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  for (const permission of formDetails.permissions) {
    const row = tbody.insertRow(-1);
    const cellStream = row.insertCell(-1);
    cellStream.innerHTML = permission.name;
    const cellLevel = row.insertCell(-1);
    cellLevel.innerHTML = permission.level;
  }
  // - grant access / open
  const buttonOpen = document.getElementById('grant-access-button');
  const buttonRevoke = document.getElementById('revoke-access-button');

  // -- pass the apiEndpoint to the next page !! Insecure just for demo
  const navData = {
    patientApiEndpoint: patientHomeLib.getPatientApiEndpoint(),
    questionaryId: formInfo.questionaryId
  }
  patientLib.navSetData(navData);

  const nextPage = (await patientLib.navGetPages(formInfo.questionaryId))[1].url;
  if (formDetails.status === 'accepted') {
    buttonOpen.innerHTML = 'Open';
    buttonOpen.onclick = async function () {
      // -- hack publish access anyway (this should be done just once)
      await patientHomeLib.publishAccess(formDetails);
      document.location.href = nextPage;
    };
    buttonRevoke.innerHTML = 'Revoke';
    buttonRevoke.onclick = async function () {
      const doRevoke = confirm('Revoke ?');
      if (doRevoke) patientHomeLib.revokeAccess(formDetails);
      refresh();
    };
  }
  else {
    buttonOpen.innerHTML = 'Grant access and Open';
    buttonOpen.onclick = async function () {
      await patientHomeLib.grantAccess(formInfo, formDetails);
      document.location.href = nextPage;
    };
    buttonRevoke.innerHTML = 'Refuse';
    buttonRevoke.onclick = async function () {
      const doRevoke = confirm('Refuse ?');
      if (doRevoke) patientHomeLib.revokeAccess(formDetails);
      refresh();
    }
  }

  // - json
  // const jsonContent = document.getElementById('card-questionnary-details-content');
  // jsonContent.innerHTML = '<pre>' + JSON.stringify(formInfo.formEvent, null, 2) + '<pre>';
}