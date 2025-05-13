import { dataDefs } from './common-data-defs.js';
import { CookieUtils } from './CookieUtils.js';



export const patientLib = {
  handleFormSubmit,
  getFormTitle,
  getFormContent,
  getHistoricalContent,
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
    field.id = field.streamId + ':' + field.eventType;
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
    field.id = field.streamId + ':' + field.eventType;
    console.log('## getFormContent ' + i, e);
    if (e.events && e.events.length > 0) {
      const event = e.events[0];
      const valueAndTxt = valueAndTxtForField(event.content, field);
      field.value = valueAndTxt.value;
      field.valueTxt = valueAndTxt.txt;
      field.eventId = event.id; // will allow t track if the event is to be updated
    } 
  }
  return formData;
};


async function getHistoricalContent(questionaryId, formKey) {
  const formFields = dataDefs.questionnaires[questionaryId].forms[formKey].content;
  const tableHeaders = formFields.map(field => ({
    fieldId: field.streamId + ':' + field.eventType,
    label: field.label,
    type: field.type
  }));

  const valuesByDateStr = {};
  function addEntry (field, time, event) {
    const dateStr = (new Date(time * 1000)).toISOString().split('T')[0];
    if (valuesByDateStr[dateStr] == null) valuesByDateStr[dateStr] = {
      dateNum: (new Date(dateStr)).getTime() / 100,
      dateStr,
    };
    const fieldId = field.streamId + ':' + field.eventType;
    const valueAndTxt = valueAndTxtForField(event.content, field);
    valuesByDateStr[dateStr][fieldId] = {
      value: valueAndTxt.value,
      valueTxt: valueAndTxt.txt,
      eventId: event.id
    }
  }

  // get the values from the API
  const apiCalls = formFields.map(field => ({
    method: 'events.get',
    params: {
      streams: [field.streamId],
      types: [field.eventType],
      limit: 20, // last 20 is enough for a demo
    }
  }));
  const res = await connection.api(apiCalls);
  for (let i = 0; i < res.length; i++) {
    const e = res[i];
    const field = formFields[i];
    if (e.events) {
      for (const event of e.events) {
        addEntry(field, event.time, event);
      }
    } 
  }

  // order by date
  const valuesByDate = Object.values(valuesByDateStr).sort((a, b) => b.dateNum - a.dateNum);
  return { tableHeaders, valuesByDate };
}

function valueAndTxtForField (eventContent, field) {
  if (field.eventType === 'activity/plain' ) {
    return { value: 'x', txt:  'X'};
  }
  if (field.type === 'date' && eventContent != null ) {
    // convert the date to a Date object
    const date = new Date(eventContent);
    if (!isNaN(date)) {
      const dayStr = date.toISOString().split('T')[0];
      return { value: dayStr, txt: dayStr }; // format YYYY-MM-DD
    } 
    console.error('## Error parsing date', eventContent);
    return {value: '', txt: 'Error parsing date'};
  }
  if (field.type === 'select') {
    let value = eventContent;
    let txt = value;
    if (field.eventType === 'ratio/generic') {
      value = eventContent.value;
    }

    const selected = field.options.find((o) => ( o.value === value ));
    if (selected) {
      txt = selected?.label;
    }
    return { value, txt };
  }
  if (field.eventType === 'ratio/generic' && eventContent != null ) {
    return { value: eventContent.value, txt:  eventContent.value};
  }
  return { value: eventContent, txt: eventContent };
}

// ---------------- create / update data ---------------- //

function parseValue (value, field) {
  const type = field.type;
  if (value === undefined || value === null || value === '') {
    return '';
  }
  if (type === 'number' || field.parseValueToNum) {
    return parseFloatCustom(value);
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
  if (type === 'select' && field.eventType === 'ratio/generic') {
    const numValue = parseFloatCustom(value);
    if (numValue === '') return '';
    // relative to is the latest value of options
    const relativeTo = field.options[field.options.length -1].value;
    return {
      value: numValue,
      relativeTo
    }
  }
  if (type === 'checkbox' && field.eventType === 'activity/plain') {
    if (value === 'x') return null; // will be handled as a value
    return '';
  }
  return value;
}

function parseFloatCustom(value) {
  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue)) {
    console.error('## Error parsing number', value);
    return '';
  }
  return parsedValue;
}

async function handleFormSubmit (formData, values, date) {
  const apiCalls = [];
  for (const field of formData) {
    const streamId = field.streamId;
    const eventType = field.eventType;
    const eventId = field.eventId;
    const value = parseValue(values[field.id], field);
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
        time: date ? date.getTime() / 1000 : null
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