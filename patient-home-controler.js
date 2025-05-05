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

async function stateChange(state) {
  if (state === 'loggedIN') {
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('card-content').style.visibility = 'visible';
    const formApiEndpoint = getRequestFrormApiEndPoint();
    console.log('## formApiEndpoint:', formApiEndpoint);
    const formsInfo = await patientHomeLib.getForms(formApiEndpoint);
    showFormList(formsInfo)
  } else {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('card-content').style.visibility = 'hidden';
  }
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
  const table = document.getElementById('questionnary-table');
  for (const formInfo of formsInfo) {
   
    // fill the table row
    const row = table.insertRow(-1);
    const cellQuestionnary = row.insertCell(-1);
    cellQuestionnary.innerHTML = formInfo.questionaryId;
    cellQuestionnary.onclick = function () {
      showFormDetails(formInfo);
    };

    const cellDr = row.insertCell(-1);
    cellDr.innerHTML = formInfo.drUserId;

    const cellStatus = row.insertCell(-1);
    cellStatus.innerHTML = formInfo.formEvent.streamIds[0];
  }
}

// ----------- Show form details ----------- //
async function showFormDetails(formInfo) {
  const show = !!formInfo;
  document.getElementById('card-questionnary-details-nothing').style.display = show ? 'none' : 'block';
  document.getElementById('card-questionnary-details-something').style.display= show ? 'block' : 'none';
  if (!show) return;
  const formDetails = await patientHomeLib.getQuestionnaryDetails(formInfo);
  console.log('## showFormDetails', formDetails);
  // - permissions
  const table = document.getElementById('access-request');
  for (const permission of formDetails.permissions) {
    const row = table.insertRow(-1);
    const cellStream = row.insertCell(-1);
    cellStream.innerHTML = permission.name;
    const cellLevel = row.insertCell(-1);
    cellLevel.innerHTML = permission.level;
  }
  // - grant access / open
  const button = document.getElementById('grant-access-button');

  // -- pass the apiEndpoint to the next page !! Insecure just for demo
  const openHREF = `patient-profile.html?patientApiEndpoint=${patientHomeLib.getPatientApiEndpoint()}&questionaryId=${formInfo.questionaryId}`;
  if (formDetails.status === 'accepted') {
    button.innerHTML = 'Open';
    button.onclick = async function () {
      // -- hack publish access anyway (this should be done just once)
      await patientHomeLib.publishAccess(formInfo, formDetails.sharedApiEndpoint);
      document.location.href = openHREF;
    };
  }
  else {
    button.innerHTML = 'Grant access and Open';
    button.onclick = async function () {
      await patientHomeLib.grantAccess(formInfo, formDetails);
      document.location.href = openHREF;
    };
  }

  // - json
  const jsonContent = document.getElementById('card-questionnary-details-content');
  jsonContent.innerHTML = '<pre>' + JSON.stringify(formInfo.formEvent, null, 2) + '<pre>';
}