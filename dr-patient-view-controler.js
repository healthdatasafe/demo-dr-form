import { drPatientLib  } from "./dr-patient-view-lib.js";
import { exportCSVFile } from "./exportToCSV.js";
/**
 * Based on 
 * - drApiConnecion
 * - patientApiConnection
 * - questionaryId
 * 
 * Display live update of data
 */


window.onload = async (event) => {
  refresh();
}

const tableHeaders = {
  time: 'Date',
  formLabel: 'Questionnary',
  formType: 'Type',
  label: 'Label',
  value: 'Value',
  description: 'Description'
}

const downloadHeaders = Object.assign({
  streamId: 'Stream Id',
  eventType: 'Event Type'
}, tableHeaders);

async function refresh () {
  const { patientApiEndpoint, questionaryId } = getRequestFrormApiEndPoint();
  const { infos, lines }  = await drPatientLib.getPatientData(patientApiEndpoint, questionaryId);
  console.log('>> zz', infos);
  // -- home button
  document.getElementById('home-button').href= 'dr.html?questionaryId=' + questionaryId;

  // -- set patient Id
  const username = infos.user.username;
  document.getElementById('patient-label').innerHTML = username;

  // -- set download button
  document.getElementById('button-download').onclick = () => {
    exportCSVFile(downloadHeaders, lines, username + '-' + questionaryId);
  };

  // -- update table
  const table = document.getElementById('patient-data-table');
  const headerRow = table.insertRow(-1);
  for (const thLabel of Object.values(tableHeaders)) {
    const headerCell = document.createElement("TH");
    headerCell.innerHTML = thLabel;
    headerRow.appendChild(headerCell);
  }
  for (const line of lines) {
    console.log('>> line', line);
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