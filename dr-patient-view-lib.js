
import { dataDefs } from './common-data-defs.js';

export const drPatientLib = {
  getPatientData
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
console.log('>> eventMapByQuestionnary', eventMapByQuestionnary);

async function getPatientData (patientApiEndoint, questionaryId) {
  const patientData = [];
  const queryParams = { limit: 10000};
  function forEachEvent(event) {
    patientData.push(getLineForEvent (event, questionaryId));
  }

  const connection = new Pryv.Connection(patientApiEndoint);
  const infos = await connection.accessInfo();
  await connection.getEventsStreamed(queryParams, forEachEvent);
  return { infos, lines: patientData };
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
  console.log('>> field', field, event);
  if (field) {
    Object.assign(line, field);
    if (field.type === 'date') {
      line.value = (new Date(event.time * 1000)).toISOString().split('T')[0];
    }
    if (field.type === 'select') {
      line.value = event.content;
      
      const selected = field.options.find((o) => ( o.value === line.value ));
      line.description = selected?.label;
    }
  }
  return line;
}