import { initHDSModel, stateGetApp } from "./common-lib.js";
import { drPatientLib  } from "./dr-patient-view-lib.js";
import { exportXLSFile } from './exporToXLS.js';

/**
 * Based on 
 * - drApiConnecion
 * - patientApiConnection
 * - questionaryId
 * 
 * Display live update of data
 */


let invite;
window.onload = async (event) => {
  await initHDSModel();
  // get collectorId & inviteKey from URL
  const params = new URLSearchParams(document.location.search);
  const collectorId = params.get('collectorId');
  const inviteKey = params.get('inviteKey');

  // get app from state management
  const appManaging = await stateGetApp('managing');
  const collector = await appManaging.getCollectorById(collectorId);
  invite = await collector.getInviteByKey(inviteKey);
  console.log('# Loaded with invite', invite);

  await drPatientLib.setRefresh(invite, refresh)
  // -- home button
  document.getElementById('home-button').href= 'dr.html?collectorId=' + collectorId;

  // - form title
  const formTitle = document.getElementById('card-questionnary-details-title');
  formTitle.innerHTML = collector.name;

  document.getElementById('patient-label').innerHTML = invite.displayName;
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
    await exportXLSFile(downloadHeaders, lines, invite.displayName + '-' + invite.collector.name);
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
