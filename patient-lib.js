import { dataDefs } from './common-data-defs.js';
import { CookieUtils } from './CookieUtils.js';



export const patientLib = {
  handleFormSubmit,
  getFormTitle,
  getFormContent,
  connect,
  navSetData,
  navGetData,
  getForms,
  navGetPages
}


let connection = null;
let _questionaryId = null;
async function connect (apiEndpoint, questionaryId) {
  connection = new Pryv.Connection(apiEndpoint);
  _questionaryId = questionaryId;
  const accessInfo = await connection.accessInfo();
  console.log('## Patient connected', accessInfo);
  return accessInfo;
}

// --------------- navigation - to be replaced if built-in framework ------- //

const COOKIE_KEY = 'hds-' + dataDefs.appId;
function navSetData(data) {
  if (data == null) return CookieUtils.del(COOKIE_KEY, '/');
  CookieUtils.set(COOKIE_KEY, data, 365, '/');
}

function navGetData() {
  const cookieContent = CookieUtils.get(COOKIE_KEY);
  const formKey = (new URLSearchParams(window.location.search)).get('formKey');
  return Object.assign({ formKey }, cookieContent);
}

const pagesByTypes = {
  home: 'patient.html',
  permanent: 'patient-profile.html',
  recurring: 'patient-history.html'
};

async function navGetPages(questionaryId) {
  const pages = [{
    type: 'home',
    url: pagesByTypes.home,
    label: 'Home',
    formKey: null
  }];
  const forms = await patientLib.getForms(questionaryId);
  for (const [formKey, form] of Object.entries(forms)) {
    pages.push({
      type: form.type,
      label: form.name,
      url: pagesByTypes[form.type] + '?formKey=' + formKey,
      formKey
    });
  }
  return pages;
}


// ---------------- form content ---------------- //

function getFormTitle (questionaryId) {
  return dataDefs.questionnaires[questionaryId].title;
}

async function getForms (questionaryId) {
  return dataDefs.questionnaires[questionaryId].forms;
}

/**
 * Get Form content
 * @param {string} questionaryId 
 * @param {string} formKey 
 * @param {Date} [date] - If editing content from existing date 
 * @returns 
 */
async function getFormContent (questionaryId, formKey, date) {
  const form = dataDefs.questionnaires[questionaryId].forms[formKey];
  console.log('## getFormContent', form, questionaryId, formKey);
  if (form.type === 'permanent') {
    return getFormExistingContent(form);
  }
  if (form.type === 'recurring') {
    return getFormRecurringContent(form, date);
  }
  return [];
}

async function getFormRecurringContent (form, date) {
  const formReccuringData = structuredClone(form.content);

  for (let i = 0; i < formReccuringData.length; i++) {
    const field = formReccuringData[i];
    field.id = form.key + '-' + i;
  }
  return formReccuringData;
  
}

// local copy of formProfileContent + actual values
/**
 * @param {*} form 
 * @param {*} date 
 * @returns 
 */
async function getFormExistingContent (form, date) {
  const formData = structuredClone(form.content);

  // get the values from the API
  const apiCalls = formData.map(field => ({
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
    const field = formData[i];
    field.id = form.key + '-' + i;
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
  return formData;
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

async function handleFormSubmit (formData, values, date) {
  const apiCalls = [];
  for (const field of formData) {
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