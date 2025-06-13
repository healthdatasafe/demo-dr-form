import { drPatientLib  } from "./dr-patient-view-lib.js";
import { exportXLSFile } from './exporToXLS.js';
import { patientLib } from "./patient-lib.js";
/**
 * Based on 
 * - drApiConnecion
 * - patientApiConnection
 * - questionaryId
 * 
 * Display live update of data
 */


let infos;
let username;
let qId;
window.onload = async (event) => {
  const { patientApiEndpoint, questionaryId } = getRequestFrormApiEndPoint();
  infos = await drPatientLib.setRefresh(patientApiEndpoint, questionaryId, refresh)
  // -- home button
  document.getElementById('home-button').href= 'dr.html?questionaryId=' + questionaryId;

  // - form title
  const formTitle = document.getElementById('card-questionnary-details-title');
  formTitle.innerHTML = patientLib.getFormTitle(questionaryId);
  
  qId = questionaryId;

  // -- set patient Id
  username = infos.user.username;
  document.getElementById('patient-label').innerHTML = username;
}

const tableHeaders = {
  time: 'Date',
  formLabel: 'Label',
  formType: 'Type',
  streamAndType: 'Stream And Type',
  value: 'Value',
  description: 'Description'
}

const downloadHeaders = Object.assign({
  streamId: 'Stream Id',
  eventType: 'Event Type'
}, tableHeaders);

async function refresh (lines) {
  // -- set download button
  document.getElementById('button-download').onclick = async () => {
    await exportXLSFile(downloadHeaders, lines, username + '-' + qId);
  };

  // -- update table
  const table = document.getElementById('patient-data-table');
  table.innerHTML = '';
  
  const headerRow = table.insertRow(-1);
  for (const thLabel of Object.values(tableHeaders)) {
    const headerCell = document.createElement("TH");
    headerCell.innerHTML = thLabel;
    headerRow.appendChild(headerCell);
  }
  for (const line of lines) {
    const row = table.insertRow(-1);
    for (const key of Object.keys(tableHeaders)) {
      const cell = row.insertCell(-1);
      const v = line[key];
      cell.innerHTML = v != null ? v : '' ;
    }
  }
}

// ------- Get Dr's info -------- //
function getRequestFrormApiEndPoint() {
  const params = new URLSearchParams(document.location.search);
  const patientApiEndpoint = params.get('patientApiEndpoint');
  const questionaryId = params.get('questionaryId');
  return { patientApiEndpoint, questionaryId };
}