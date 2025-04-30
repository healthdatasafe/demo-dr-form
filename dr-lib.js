let connection = null;

const drLib = {
  showLoginButton,
  getSharingToken,
  getPatientsList,
  getFields
}

function showLoginButton (loginSpanId, stateChangeCallBack) {

  const authSettings = {
    spanButtonID: loginSpanId, // div id the DOM that will be replaced by the Service specific button
    onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
    authRequest: { // See: https://api.pryv.com/reference/#auth-request
      requestingAppId: 'demo-dr-form-dr', // to customize for your own app
      requestedPermissions: [ 
        {
          streamId: '*',
          level: 'manage' 
        }
      ],
      clientData: {
        'app-web-auth:description': {
          'type': 'note/txt',
          'content': 'This app allows to send invitation links to patients and visualize and export answers.'
        } 
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
      await initDrAccount(connection);
      stateChangeCallBack('loggedIN');
    }
    if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
      connection = null;
      stateChangeCallBack('loggedOUT');
    }
  }
}

// -------- Fetch patient list --------

const patients = {};

async function getPatientsList () {
  const res = await connection.api([{ method: 'events.get', params: { types: ['credentials/pryv-api-endpoint'] } }]);
  const patientApiEndpointEvents = res[0].events;
  for (const event of patientApiEndpointEvents) {
    if (event.type === 'credentials/pryv-api-endpoint') {
      const patient = {
        apiEndpoint: event.content,
        formData: {}
      };
      const patientConnection = new Pryv.Connection(patient.apiEndpoint);
      // -- get patient info
      const patientInfo = await patientConnection.accessInfo();
      patient.username = patientInfo.user.username;

      // -- get data
      const profileEvents = await patientConnection.api([{ method: 'events.get', params: { limit: 100 } }]);
      for (const profileEvent of profileEvents[0].events) {
        const field = dataFieldFromEvent(profileEvent);
        if (field) {
          patient.formData[field.key] = field;
        }
      }
      patients[patient.username] = patient;
    }
  }

  console.log('## Patients list', patients);
  return patients;
}

/**
 * get the list of rows for the table
 */
function getFields () {
  return dataDefs.formProfileContent;
};

const dataFieldsCache = {};
function initFieldsCache () {
  if (Object.keys(dataFieldsCache).length !== 0) return;
  for (const formField of dataDefs.formProfileContent) {
    const dataFieldId = formField.streamId + ':' + formField.eventType;
    dataFieldsCache[dataFieldId] = formField;
  }
}

/**
 * Link an event to a data field from form
 * @param {*} event 
 */
function dataFieldFromEvent (event) {
  initFieldsCache(event);
  const formFieldId = event.streamId + ':' + event.type;
  const dataField = dataFieldsCache[formFieldId];
  if (!dataField) {
    console.error('## Data field not found for event', event);
    return null;
  }
  const field = {
    formFieldId,
    key: dataField.dataFieldKey,
    label: dataField.label,
    type: dataField.type,
    value: event.content,
    event: event
  };
  return field;
}

// -------- init functions --------

/**
 * Initialize the doctor account
 * @param {*} connection 
 */
async function initDrAccount (connection) {
  await initStreams(connection);
  console.log('## Dr account initialized')
}

/**
 * Initialize or get the sharing token for patients
 * @returns 
 */
async function getSharingToken () {
  const accessesCheckRes = await connection.api([{ method: 'accesses.get', params: {}}]);
  const sharedAccess = accessesCheckRes[0].accesses.find(access => access.name === 'demo-dr-form-shared');
  if (sharedAccess) {
    console.log('## Dr account already has a shared access');
    return sharedAccess.apiEndpoint;
  }
  const accessRes = await connection.api([{ 
    method: 'accesses.create', 
    params: {
      name: 'demo-dr-form-shared',
      type: 'shared',
      permissions: [{
          streamId: 'patients-inbox',
          level: 'create-only'
        },
        {
          streamId: 'demo-dr-forms-questionary-x',
          level: 'read'
        },
        { // for "publicly shared access" always forbid the selfRevoke feature
          feature: "selfRevoke",
          setting: "forbidden"
        }],
      clientData: {
        'demo-dr-form': {
          questionaryId: 'demo-dr-forms-questionary-x'
        }
      }
    }
  }]);
  console.log('## Dr account shared access created', accessRes);
  return accessRes[0].access.apiEndpoint;
}


async function initStreams () {
  // check if the account is already initialized
  const resStreams = await connection.api([{ method: 'streams.get', params: { parentId: 'patients' } }]);
  if (resStreams[0].streams.length > 0) {
    console.log('## Dr account streams already initialized');
    return;
  }

  // create stream structure (even if already exists)
  const apiCalls = [
    { 
      method: 'streams.create',
      params: {
        id: 'patients',
        name: 'Patients'
      }
    },
    { 
      method: 'streams.create',
      params: {
        id: 'patients-inbox',
        name: 'Patients Inbox',
        parentId: 'patients'
      }
    },
    { 
      method: 'streams.create',
      params: {
        id: 'patients-validated',
        name: 'Patients Validted',
        parentId: 'patients'
      }
    },
    { 
      method: 'streams.create',
      params: {
        id: 'demo-dr-forms',
        name: 'Demo Dr Forms'
      }
    },
    { 
      method: 'streams.create',
      params: {
        id: 'demo-dr-forms-questionary-x',
        name: 'Questionnary x'
      }
    }
  ];
  const result = await connection.api(apiCalls);
  console.log('## Dr account streams created', result);
}