import { drPatientLib  } from "./dr-patient-view-lib.js";
import { exportCSVFile } from "./exportToCSV.js";
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
window.onload = async (event) => {
  const { patientApiEndpoint, questionaryId } = getRequestFrormApiEndPoint();
  infos = await drPatientLib.setRefresh(patientApiEndpoint, questionaryId, refresh)
  // -- home button
  document.getElementById('home-button').href= 'dr.html?questionaryId=' + questionaryId;

  // - form title
  const formTitle = document.getElementById('card-questionnary-details-title');
  formTitle.innerHTML = patientLib.getFormTitle(questionaryId);
  
  // -- set patient Id
  const username = infos.user.username;
  document.getElementById('patient-label').innerHTML = username;
}

const tableHeaders = {
  time: 'Date',
  formLabel: 'Set',
  formType: 'Type',
  label: 'Label',
  value: 'Value',
  description: 'Description'
}

const downloadHeaders = Object.assign({
  streamId: 'Stream Id',
  eventType: 'Event Type'
}, tableHeaders);

async function refresh (lines) {
  // -- set download button
  document.getElementById('button-download').onclick = () => {
    exportCSVFile(downloadHeaders, lines, username + '-' + questionaryId);
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