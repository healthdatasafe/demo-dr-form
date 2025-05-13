
import { dataDefs } from './common-data-defs.js';

export const drPatientLib = {
  setRefresh
}

let connection;
async function setRefresh(patientApiEndoint, questionaryId, refreshCallBack) {
  connection = new Pryv.Connection(patientApiEndoint);
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


// prepare data for easy lookup 
// map streamId/EventType with form data
const eventMapByQuestionnary = {};
for (const [questionaryId, questionary] of Object.entries(dataDefs.questionnaires)) {
  eventMapByQuestionnary[questionaryId] = {};
  for (const form of Object.values(questionary.forms)) {
    for (const field of form.content) {
      eventMapByQuestionnary[questionaryId][field.streamId + ':' + field.eventType] = Object.assign({
        formLabel: form.name,
        formType: form.type
      }, field);
    }
  }
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
  const line = {
    time: (new Date(event.time * 1000)).toISOString(),
    formLabel: 'Unkown',
    formType: 'Unkown',
    label: event.streamId + ' - ' + event.type,
    value: JSON.stringify(event.content),
    description: ''
  }
  
  const field = eventMapByQuestionnary[questionaryId][event.streamId + ':' + event.type];
  if (field) {
    Object.assign(line, field);
    if (field.type === 'date') {
      line.value = (new Date(event.time * 1000)).toISOString().split('T')[0];
    }
    if (field.type === 'select') {
      line.value = event.content;
      if (field.eventType === 'ratio/generic') {
        line.value = event.content.value;
      }

      const selected = field.options.find((o) => ( o.value === line.value ));
      line.description = selected?.label;
    }
    if (field.type === 'checkbox') {
      if (event.type === 'activity/plain') {
        line.description = 'X';
        line.value = 'x';
      }
    }
  }
  return line;
}