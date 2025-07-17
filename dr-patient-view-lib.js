

export const drPatientLib = {
  setRefresh
}

async function setRefresh(invite, refreshCallBack) {

  async function doRefresh () {
    const lines = await getPatientData(invite); 
    refreshCallBack(lines);
  }

  await invite.connection.socket.open();
  invite.connection.socket.on('eventsChanged', async () => {
    await doRefresh();
  });

  // do it once
  doRefresh();
}


async function getPatientData (invite) {
  const patientData = [];
  const queryParams = { limit: 10000};
  function forEachEvent(event) {
    patientData.push(getLineForEvent (event));
  }

  
  await invite.connection.getEventsStreamed(queryParams, forEachEvent);
  return patientData;
}


function getLineForEvent (event) {
  const model = HDSLib.model;
  const line = {
    time: (new Date(event.time * 1000)).toISOString(),
    formLabel: 'Unkown',
    formType: 'Unkown',
    streamAndType: event.streamId + ' - ' + event.type,
    value: JSON.stringify(event.content),
    description: ''
  }

  const itemDef = model.itemsDefs.forEvent(event, false);
  if (itemDef) {
    line.streamId = event.streamIds[0];
    line.eventType = event.type;
    line.formLabel = itemDef.label;
    line.formType = itemDef.data.type;
    if (line.formType === 'date') {
      line.value = (new Date(event.time * 1000)).toISOString().split('T')[0];
    }
    if (line.formType === 'select') {
      line.value = event.content;
      if (event.type === 'ratio/generic') {
        line.value = event.content.value;
      }

      const selected = itemDef.data.options.find((o) => ( o.value === line.value ));
      line.description = selected != null ? HDSLib.l(selected.label) : '-';
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