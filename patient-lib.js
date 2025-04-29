let connection = null;

const patientLib = {
  showLoginButton,
  handleFormSubmit,
  getFormContent,
  initSharingWithDr,
}

function showLoginButton (loginSpanId, stateChangeCallBack) {

  const requestedPermissions = dataDefs.patientBasePermissions.map(perm => ({
    streamId: perm.id,
    defaultName: perm.name,
    level: 'manage'
  }));

  const authSettings = {
    spanButtonID: loginSpanId, // div id the DOM that will be replaced by the Service specific button
    onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
    authRequest: { // See: https://api.pryv.com/reference/#auth-request
      requestingAppId: 'demo-dr-form-patient', // to customize for your own app
      requestedPermissions,
      clientData: {
        'app-web-auth:description': {
          'type': 'note/txt',
          'content': 'This app allows to fill a form and share information with your doctor.'
        },
        'app-web-auth:ensureBaseStreams': [
          {id: 'body', name: 'Body metrics'},
          {id: 'body-height', name: 'Body height', parentId: 'body'},
          {id: 'body-weight', name: 'Body weight', parentId: 'body'}
        ]
      },
    }
  };

  // following the APP GUIDELINES: https://api.pryv.com/guides/app-guidelines/
  const serviceInfoUrl = Pryv.Browser.serviceInfoFromUrl() || 'https://demo.datasafe.dev/reg/service/info';
  Pryv.Browser.setupAuth(authSettings, serviceInfoUrl);

  async function pryvAuthStateChange(state) { // called each time the authentication state changes
    console.log('##pryvAuthStateChange', state);
    if (state.id === Pryv.Browser.AuthStates.AUTHORIZED) {
      connection = new Pryv.Connection(state.apiEndpoint);
      await initPatientAccount(connection);
      stateChangeCallBack('loggedIN');
    }
    if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
      connection = null;
      stateChangeCallBack('loggedOUT');
    }
  }
}

// Creates the streams structure for the patient account after the user has logged in
async function initPatientAccount (connection) {
  
  const apiCalls = dataDefs.patientBaseStreams.map(stream => ({
    method: 'streams.create',
    params: {
      id: stream.id,
      name: stream.name,
      parentId: stream.parentId
    }
  }));
  // create stream structure (even if already exists)
  const res = await connection.api(apiCalls);
  console.log('## Patient account streams created', res);
  console.log('## Patient account initialized')
}

// ---- if first connection to the app create a sharing for the Dr and submit it ---- //
async function initSharingWithDr (formApiEndpoint) {
  const drConnection = new Pryv.Connection(formApiEndpoint);
  const drAccessInfo = await drConnection.accessInfo();
  console.log('## Dr connection info', drAccessInfo);
  const questionaryId = drAccessInfo.clientData?.['demo-dr-form']?.questionaryId;
  const drUserId = drAccessInfo.user.username;
  // creates a unique id for the shaing access in case of two drs using the same app
  const sharingAccessId = `${drUserId}-${questionaryId}`;

  //-- check if the access already exists --//
  const accessesCheckRes = await connection.api([{ method: 'accesses.get', params: {}}]);
  const sharedAccess = accessesCheckRes[0].accesses.find(access => access.name === sharingAccessId);
  if (sharedAccess) {
    console.log('## Already created access for this Dr');
    return;
  }
  //-- create a set of permission based on the datadefs streams --//
  const permissions = dataDefs.patientBasePermissions.map(perm => ({
    streamId: perm.id,
    level: 'read'
  }));

  const accessRes = await connection.api([{ 
    method: 'accesses.create', 
    params: {
      name: sharingAccessId,
      type: 'shared',
      permissions: permissions,
      clientData: {
        'demo-dr-form': {
          questionaryId: 'demo-dr-forms-questionary-x'
        }
      }
    }
  }]);
  const createdAccess = accessRes[0].access;
  console.log('## Patient shared access created', accessRes);

  // publishing access on Dr Account
  const apiCalls = [{
    method: 'events.create',
    params: {
      streamIds: ['patients-inbox'],
      type: 'credentials/pryv-api-endpoint',
      content: createdAccess.apiEndpoint
    }
  }];
  const publishRes = await drConnection.api(apiCalls);
  console.log('## Shared access published to Dr Account', publishRes);
}

// ---------------- form content ---------------- //


// local copy of formContent + actual values
let formData = null;
async function getFormContent () {
  if (formData) { return formData; }
  formData = structuredClone(dataDefs.formContent);
  formInitialized = true; // prevent multiple calls to this function

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
    field.id = 'field-' + i; // generate a unique id for the field
    console.log('## getFormContent ' + i, e);
    if (e.events && e.events.length > 0) {
      const event = e.events[0];
      field.value = event.content;
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
  return value;
}

async function handleFormSubmit (values) {
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