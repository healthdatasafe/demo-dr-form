let connection = null;

const patientLib = {
  showLoginButton,
  handleFormSubmit,
  getFormContent,
}

function showLoginButton (loginSpanId, stateChangeCallBack) {

  const authSettings = {
    spanButtonID: loginSpanId, // div id the DOM that will be replaced by the Service specific button
    onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
    authRequest: { // See: https://api.pryv.com/reference/#auth-request
      requestingAppId: 'demo-dr-form-patient', // to customize for your own app
      requestedPermissions: [ 
        {
          streamId: 'profile',
          defaultName: 'Profile',
          level: 'manage' 
        },
        {
          streamId: 'family',
          defaultName: 'Family',
          level: 'manage' 
        },
        {
          streamId: 'fertility',
          defaultName: 'Fertility',
          level: 'manage' 
        },
        {
          streamId: 'body-height',
          defaultName: 'Body height',
          level: 'manage' 
        },
        {
          streamId: 'body-weight',
          defaultName: 'Body weight',
          level: 'manage' 
        }
      ],
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
  const patientBaseStreams = [
    // profile
    {id: 'profile-name', name: 'Name', parentId: 'profile'},
    {id: 'profile-nationality', name: 'Nationality', parentId: 'profile'},
    {id: 'profile-date-of-birth', name: 'Date of Birth', parentId: 'profile'},
    {id: 'profile-location', name: 'Location', parentId: 'profile'},
    {id: 'profile-sex', name: 'Sex', parentId: 'profile'},
    // family
    {id: 'family-children', name: 'Children', parentId: 'family'},
    // fertility
    {id: 'fertility-miscarriages', name: 'Miscarriages', parentId: 'fertility'},
    {id: 'fertility-traings', name: 'Trainings', parentId: 'fertility'},
    {id: 'fertility-cycles', name: 'Cycles', parentId: 'fertility'},
    {id: 'fertility-cycles-charted-extimation', name: 'Cycles charted estimation', parentId: 'fertility'},
    {id: 'fertility-ttc-tta', name: 'Trying to conceive / Avoiding pregnancy', parentId: 'fertility'},
  ];
  const apiCalls = patientBaseStreams.map(stream => ({
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

// ---------------- form content ---------------- //

const formContent = [
  {
    streamId: 'profile-name',
    eventType: 'contact/name',
    contentField: 'name',
    type: 'text',
    label: 'Name',
  },
  {
    streamId: 'profile-name',
    eventType: 'contact/surname',
    contentField: 'surname',
    type: 'text',
    label: 'Surname',
  },
  {
    streamId: 'profile-nationality',
    eventType: 'contact/nationality',
    type: 'text',
    label: 'Nationality',
  },
];

let formInitialized = null;
async function getFormContent () {
  if (formInitialized) { return formContent; }
  formInitialized = true; // prevent multiple calls to this function

  // get the values from the API
  const apiCalls = formContent.map(field => ({
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
    const field = formContent[i];
    field.id = 'field-' + i; // generate a unique id for the field
    console.log('## getFormContent ' + i, e);
    if (e.events && e.events.length > 0) {
      const event = e.events[0];
      field.value = event.content;
      field.eventId = event.id; // will allow t track if the event is to be updated
    } 
  }
  return formContent;
};

// ---------------- create / update data ---------------- //
async function handleFormSubmit (values) {
  const apiCalls = [];
 for (const field of formContent) {
    const streamId = field.streamId;
    const eventType = field.eventType;
    const eventId = field.eventId;
    const value = values[field.id];

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
      // no change
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