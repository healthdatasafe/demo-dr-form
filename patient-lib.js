const patientLib = {
  handleFormSubmit,
  getFormContent,
  connect
}

let connection = null;
let questionaryId = null;
async function connect (apiEndpoint, questionaryId) {
  connection = new Pryv.Connection(apiEndpoint);
  const accessInfo = await connection.accessInfo();
  console.log('## Patient connected', accessInfo);
  return accessInfo;
}

// ---------------- form content ---------------- //

async function getFormContent (questionaryId, formKey) {
  const form = dataDefs.questionnaires[questionaryId].forms[formKey];
  console.log('## getFormContent', form);
  if (form.type === 'permanent') {
    return getFormPermanentContent(form);
  }
  if (formKey === 'recurring') {
    return getFormRecurringContent(form);
  }
  return [];
}

async function getFormRecurringContent (form) {
  const formReccuringData = structuredClone(form.content);
  formReccuringData.forEach(field => {
    field.id = 'field-historical-' + field.dataFieldKey; 
  });
  return formReccuringData;
}

// local copy of formProfileContent + actual values
let formPermanentData = null;
async function getFormPermanentContent (form) {
  if (formPermanentData) { return formPermanentData; }
  formPermanentData = structuredClone(form.content);

  // get the values from the API
  const apiCalls = formPermanentData.map(field => ({
    method: 'events.get',
    params: {
      streams: [field.streamId],
      types: [field.eventType],
      limit: 1,
    }
  }));

  const res = await connection.api(apiCalls);
  for (let i = 0; i < res.length; i++) {
    const e = res[i];
    const field = formPermanentData[i];
    field.id = 'field-profile-' + field.dataFieldKey;
    console.log('## getFormContent ' + i, e);
    if (e.events && e.events.length > 0) {
      const event = e.events[0];
      if (field.type === 'date' && event.content != null ) {
        // convert the date to a Date object
        const date = new Date(event.content);
        if (!isNaN(date)) {
          field.value = date.toISOString().split('T')[0]; // format YYYY-MM-DD
        } else {
          console.error('## Error parsing date', event.content);
          field.value = '';
        }
      } else {
        field.value = event.content;
      }
      field.eventId = event.id; // will allow t track if the event is to be updated
    } 
  }
  return formPermanentData;
};

// ---------------- create / update data ---------------- //

function parseValue (value, type) {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  if (type === 'number') {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      console.error('## Error parsing number', value);
      return '';
    }
    return parsedValue;
  }
  if (type === 'boolean') {
    return value === 'true';
  }
  if (type === 'date') {
    if (value instanceof Date && !isNaN(value)) {
      return value.toISOString();
    }
    return value === '';
  }
  return value;
}

async function handleFormSubmit (questionaryId, formKey, values) {
  const apiCalls = [];
  for (const field of formPermanentData) {
    const streamId = field.streamId;
    const eventType = field.eventType;
    const eventId = field.eventId;
    const value = parseValue(values[field.id], field.type);
    if (value === '' && eventId) {
      // delete the event
      apiCalls.push({
        method: 'events.delete',
        params: {
          id: eventId,
        }
      });
      continue;
    }

    if (value === field.value || value === '') {
      // no change or noting to create
      continue;
    }

    if (eventId) {
      // update the event
      apiCalls.push({
        method: 'events.update',
        params: {
          id: eventId,
          update: {
            content: value
          }
        }
      });
      continue;
    } 
    // create a new event
    apiCalls.push({
      method: 'events.create',
      params: {
        streamId: streamId,
        type: eventType,
        content: value,
      }
    });
  }
  if (apiCalls.length === 0) {
    console.log('## No changes to submit');
    return;
  }
  // send the API calls
  const res = await connection.api(apiCalls);
  console.log('## Form submitted', res);
}