import { dataDefs } from './common-data-defs.js';
import { CookieUtils } from './CookieUtils.js';
import { connectAPIEndpoint, hdsModel } from "./common-lib.js"


export const patientLib = {
  handleFormSubmit,
  getFormTitle,
  getFormPermanentContent,
  getFormHistorical,
  getHistoricalContent,
  connect,
  navSetData,
  navGetData,
  navGetPages
}


let connection = null;
let _questionaryId = null;
async function connect (apiEndpoint, questionaryId) {
  connection = await connectAPIEndpoint(apiEndpoint);
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
  const forms = await getForms(questionaryId);
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
  return dataDefs.v2questionnaires[questionaryId].title;
}

async function getForms (questionaryId) {
  return dataDefs.v2questionnaires[questionaryId].forms;
}


async function getFormHistorical (questionaryId, formKey) {
  const form = dataDefs.v2questionnaires[questionaryId].forms[formKey];
  const formFields = form.itemKeys.map((itemKey) => {
    const itemDef = (hdsModel().itemsDefs.forKey(itemKey));
    
    return {
      id: itemDef.key,
      label: itemDef.data.label.en,
      type: itemDef.data.type,
      options: itemDef.data.options,
      itemDef
    } 
  });
  return formFields;
}

// local copy of formProfileContent + actual values
/**
 * @param {*} form 
 * @param {*} date 
 * @returns 
 */
async function getFormPermanentContent (questionaryId, formKey) {
  const form = dataDefs.v2questionnaires[questionaryId].forms[formKey];
  // get formItems
  const formItemDefs = form.itemKeys.map((itemKey) => (hdsModel().itemsDefs.forKey(itemKey)));
  // get the values from the API
  const apiCalls = formItemDefs.map(itemDef => ({
    method: 'events.get',
    params: {
      streams: [itemDef.data.streamId],
      types: itemDef.eventTypes,
      limit: 1,
    }
  }));

  const formContent = [];
  const res = await connection.api(apiCalls);
  for (let i = 0; i < res.length; i++) {
    const e = res[i];
    const itemDef = formItemDefs[i];
    const content = {
      id: itemDef.key,
      type: itemDef.data.type,
      label: itemDef.data.label.en,
      options: itemDef.data.options,
      itemDef,
    }
    if (e.events && e.events.length > 0) {
      const event = e.events[0];
      const valueAndTxt = valueAndTxtForField(event, itemDef);
      console.log('>> valueAndtxt', {event, valueAndTxt});
      content.value = valueAndTxt.value;
      content.valueTxt = valueAndTxt.txt;
      content.eventId = event.id; // will allow t track if the event is to be updated
    } else {
      console.log('>> no event', e);
    }
    formContent.push(content);
  }
  return formContent;
};


async function getHistoricalContent(questionaryId, formKey) {
  const form = dataDefs.v2questionnaires[questionaryId].forms[formKey];
  const itemDefs = form.itemKeys.map((itemKey) => (hdsModel().itemsDefs.forKey(itemKey)));
  const tableHeaders = itemDefs.map(itemDef => ({
    fieldId: itemDef.key,
    label: itemDef.data.label.en,
    type: itemDef.data.type
  }));

  const valuesByDateStr = {};
  function addEntry (event) {
    const itemDef = hdsModel().itemsDefs.forEvent(event, false);
    if (itemDef == null) {
      console.log('Historical content -- unkown event', event);
      return;
    }
    const dateStr = (new Date(event.time * 1000)).toISOString().split('T')[0];
    if (valuesByDateStr[dateStr] == null) valuesByDateStr[dateStr] = {
      dateNum: (new Date(dateStr)).getTime() / 1000,
      dateStr,
    };
    const valueAndTxt = valueAndTxtForField(event, itemDef);
    valuesByDateStr[dateStr][itemDef.key] = {
      value: valueAndTxt.value,
      valueTxt: valueAndTxt.txt,
      eventId: event.id
    }
  }

  // get the values from the API
  const apiCalls = itemDefs.map(itemDef => ({
    method: 'events.get',
    params: {
      streams: [itemDef.data.streamId],
      types: itemDef.eventTypes,
      limit: 20, // last 20 of each item is enough for a demo
    }
  }));
  const res = await connection.api(apiCalls);
  for (let i = 0; i < res.length; i++) {
    const e = res[i];
    if (e.events) {
      for (const event of e.events) {
        addEntry(event);
      }
    } 
  }

  // order by date
  const valuesByDate = Object.values(valuesByDateStr).sort((a, b) => b.dateNum - a.dateNum);
  return { tableHeaders, valuesByDate };
}

function valueAndTxtForField (event, itemDef) {
  if (event.type === 'activity/plain' ) {
    return { value: 'x', txt:  'X'};
  }
  if (itemDef.data.type === 'date' && event.content != null ) {
    // convert the date to a Date object
    const date = new Date(event.content);
    if (!isNaN(date)) {
      const dayStr = date.toISOString().split('T')[0];
      return { value: dayStr, txt: dayStr }; // format YYYY-MM-DD
    } 
    console.error('## Error parsing date', event.content);
    return {value: '', txt: 'Error parsing date'};
  }
  if (itemDef.data.type === 'select') {
    let value = event.content;
    let txt = value;
    if (event.type === 'ratio/generic') {
      value = event.content.value;
    }
    console.log({value, event})
    const selected = itemDef.data.options.find((o) => ( o.value === value ));
    if (selected) {
      txt = selected?.label.en;
    }
    return { value, txt };
  } 
  if (event.type === 'ratio/generic' && event.content != null ) {
    return { value: event.content.value, txt:  event.content.value};
  }
  return { value: event.content, txt: event.content };
}

// ---------------- create / update data ---------------- //

function parseValue (value, field) {
  const type = field.itemDef.data.type;
  console.log('>> parsValue', {value, field});
  if (value === undefined || value === null || value === '') {
    return '';
  }
  if (type === 'number') {
    return parseFloatCustom(value);
  }
  if (type === 'date') {
    if (value instanceof Date && !isNaN(value)) {
      return value.toISOString();
    }
    return value === '';
  }
  if (type === 'select' && field.itemDef.eventTypes[0] === 'ratio/generic') {
    const numValue = parseFloatCustom(value);
    if (numValue === '') return '';
    // relative to is the latest value of options
    const relativeTo = field.options[field.options.length -1].value;
    return {
      value: numValue,
      relativeTo
    }
  }
  if (type === 'checkbox' && field.itemDef.eventTypes[0] === 'activity/plain') {
    if (value === 'true') return null; // will be handled as a value
    return '';
  }
  if (type === 'checkbox') {
    return value === 'true';
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
  console.log('## handleForm', {formData, values, date});
  const apiCalls = [];
  for (const field of formData) {
    const streamId = field.itemDef.data.streamId;
    const eventType = field.itemDef.eventTypes[0];
    const eventId = field.eventId;
    const value = parseValue(values[field.id], field);
    console.log('>> parsed value:', value);
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
    const eventData = {
      streamId: streamId,
      type: eventType,
      content: value
    };
    if (date) eventData.time = date.getTime() / 1000;

    apiCalls.push({
      method: 'events.create',
      params: eventData
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