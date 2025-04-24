let connection = null;

const drLib = {
  showLoginButton

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
      await initPatientAccount(connection);
      stateChangeCallBack('loggedIN');
    }
    if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
      connection = null;
      stateChangeCallBack('loggedOUT');
    }
  }
}

async function initPatientAccount (connection) {
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
  console.log(result);
  console.log('## Dr account initialized')
}