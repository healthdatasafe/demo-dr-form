

import { connectAPIEndpoint, hdsModel } from './common-lib.js';

export const drPatientLib = {
  setRefresh
}

let connection;
async function setRefresh(patientApiEndoint, questionaryId, refreshCallBack) {
  connection = await connectAPIEndpoint(patientApiEndoint);
  const infos = await connection.accessInfo();

  async function doRefresh () {
    const lines = await getPatientData(questionaryId); 
    refreshCallBack(lines);
  }

  await connection.socket.open();
  connection.socket.on('eventsChanged', async () => {
    await doRefresh();
  });

  // do it once
  doRefresh();
  return infos;
}


async function getPatientData (questionaryId) {
  const patientData = [];
  const queryParams = { limit: 10000};
  function forEachEvent(event) {
    patientData.push(getLineForEvent (event, questionaryId));
  }

  
  await connection.getEventsStreamed(queryParams, forEachEvent);
  return patientData;
}


function getLineForEvent (event, questionaryId) {
  const model = hdsModel();
  const line = {
    time: (new Date(event.time * 1000)).toISOString(),
    formLabel: 'Unkown',
    formType: 'Unkown',
    label: event.streamId + ' - ' + event.type,
    value: JSON.stringify(event.content),
    description: ''
  }

  const itemDef = model.itemDefForEvent(event, false);
  if (itemDef) {
    line.formLabel = itemDef.data.label.en;
    line.formType = itemDef.data.type;
    if (line.formType === 'date') {
      line.value = (new Date(event.time * 1000)).toISOString().split('T')[0];
    }
    if (line.formType === 'select') {
      line.value = event.content;
      if (itemDef.types[0] === 'ratio/generic') {
        line.value = event.content.value;
      }

      const selected = itemDef.data.options.find((o) => ( o.value === line.value ));
      line.description = selected?.label.en;
    }
    if (line.formType === 'checkbox') {
      if (event.type === 'activity/plain') {
        line.description = 'X';
        line.value = 'x';
      }
    }
  }
  return line;
}