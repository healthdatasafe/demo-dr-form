const patientHomeLib = {
  getForms,
  getQuestionnaryDetails,
  grantAccess,
  showLoginButton,
  getPatientApiEndpoint,
  publishAccess,
  revokeAccess
}

const AppBaseStreams = {
  base: {id: 'demo-dr-forms', name: 'Demo Dr Forms'},
  inbox: {id: 'demo-dr-forms-inbox', name: 'Demo Dr Forms - Inbox', parentId: 'demo-dr-forms'},
  accepted: {id: 'demo-dr-forms-accepted', name: 'Demo Dr Forms - Accepted', parentId: 'demo-dr-forms'},
  rejected: {id: 'demo-dr-forms-rejected', name: 'Demo Dr Forms - Rejected', parentId: 'demo-dr-forms'},
};


/**
 * Load app & get the forms
 * - initBaseFormsStreams
 * - getCurrentFroms
 * - eventually add new form request
 * @param {*} connection 
 */
async function getForms (formApiEndpoint) {
  // init base for streams
  await initBaseFormsStreams(connection);
  // get list of form
  const eventRes = await connection.api([{ method: 'events.get', params: { streams: [AppBaseStreams.base.id], limit: 100}}]);

  const forms = eventRes[0].events;

  if (formApiEndpoint) {
    const foundRequestedForm = forms.find(formEvent => formEvent.content === formApiEndpoint);
    if (! foundRequestedForm) {
      console.log('## No form found for this API endpoint, creating a new one');
      const apiCalls = [{
        method: 'events.create',
        params: {
          streamIds: [AppBaseStreams.inbox.id],
          type: 'credentials/pryv-api-endpoint',
          content: formApiEndpoint
        }
      }];
      const res = await connection.api(apiCalls);
      forms.push(res[0].event);
      console.log('## Form created', res);
    }
  }
  console.log('## Current forms:', forms);

  const formsInfo = [];
  // add forms details 
  for (const formEvent of forms) {
    const formInfo = await getQuestionnaryInfo(formEvent);
    formsInfo.push(formInfo);
  }


  return formsInfo;
}


// Creates the the streams structure for accepted and rejected froms
async function initBaseFormsStreams (connection) {
  const streams = Object.values(AppBaseStreams);
  await createsPatientAccountStreams(connection, streams);
}


// Creates the streams structure for the patient account after the user has logged in
async function createsPatientAccountStreams (connection, streams) {
  const apiCalls = streams.map(stream => ({
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
}

// ---- if first connection to the app create a sharing for the Dr and submit it ---- //
async function grantAccess (formInfo, formDetails) {
  // create needed base streams
  const baseStreams = dataDefs.questionnaires[formInfo.questionaryId].patientBaseStreams;
  await createsPatientAccountStreams(connection, baseStreams);
  
  // remove unecessary permissions details
  const permissionsCleaned = formDetails.permissions.map(perm => ({
    streamId: perm.streamId,
    level: perm.level,
  }));

  const accessRes = await connection.api([{ 
    method: 'accesses.create', 
    params: {
      name: formInfo.sharingAccessId,
      type: 'shared',
      permissions: permissionsCleaned,
      clientData: {
        'demo-dr-form': {
          questionaryId: formInfo.questionaryId,
        }
      }
    }
  }]);
  const createdAccess = accessRes[0].access;
  console.log('## Patient shared access created', accessRes);
  await publishAccess (formInfo, createdAccess.apiEndpoint);
}

async function publishAccess (formInfo, apiEndpoint) {
  // create needed base streams
  const baseStreams = dataDefs.questionnaires[formInfo.questionaryId].patientBaseStreams;
  await createsPatientAccountStreams(connection, baseStreams);

  // publishing access on Dr Account
  const apiCalls = [{
    method: 'events.create',
    params: {
      streamIds: ['patients-inbox'],
      type: 'credentials/pryv-api-endpoint',
      content: apiEndpoint
    }
  }];
  const publishRes = await formInfo.drConnection.api(apiCalls);
  console.log('## Shared access published to Dr Account', publishRes);
  if (! publishRes[0].event) {
    const error = new Error('Failed publishing Acces');
    error.innerObject = publishRes
    throw error;
  }
  // -- update access and place in 'demo-dr-forms-accepted'
  await updateEventFormStatus(formInfo, 'accepted');
}

/**
 * 
 * @param {*} formInfo 
 * @param {string} newStatus 'accepted', 'rejected'
 */
async function updateEventFormStatus (formInfo, newStatus) {
  const newStreamId = AppBaseStreams[newStatus].id;
  const previousStreamsId = formInfo.formEvent.streamIds[0];
  if (newStreamId === previousStreamsId) return;
  const apiCalls = [{
    method: 'events.update',
    params: {
      id: formInfo.formEvent.id,
      update: {
        streamIds: [newStreamId]
      }
    }
  }];
  const updateEvent = await connection.api(apiCalls);
  console.log('## event Form status updated', newStatus, updateEvent);
  formInfo.formEvent.streamIds = [newStreamId]
}

async function revokeAccess (formDetails) {
  // revoke access
  const revokeRes = await connection.api([{
    "method": "accesses.delete",
    "params": {
      "id": formDetails.sharedAccessId
    }
  }]);
  console.log("## revokeAccess res", revokeRes);
  // -- update access and place in 'demo-dr-forms-rejected'
  await updateEventFormStatus(formDetails.formInfo, 'rejected');
}

// ---- Get questionnary details ---- //
async function getQuestionnaryDetails (formInfo) {
  const details = {
    formInfo,
    status : 'pending',
  }

   //-- check if the access already exists --//
   const accessesCheckRes = await connection.api([{ method: 'accesses.get', params: { includeDeletions: true }}]);
   const sharedAccess = accessesCheckRes[0].accesses.find(access => access.name === formInfo.sharingAccessId);
   if (sharedAccess) {
     details.status = 'accepted';
     details.sharedApiEndpoint = sharedAccess.apiEndpoint;
     details.sharedAccessId = sharedAccess.id;
   }

   //-- get access permissions request --//
   const drAccessInfo = await formInfo.drConnection.accessInfo();
   const questionaryId = drAccessInfo.clientData?.['demo-dr-form']?.questionaryId;
   console.log('## Questionnary ID', questionaryId);

   details.permissions = dataDefs.questionnaires[questionaryId]?.permissions;
   return details;
}




// -- creates an object with the questionnaryInformations -- //
async function getQuestionnaryInfo (formEvent) {
   // retreive base information from the form
  const formApiEndpoint = formEvent.content;
  const drConnection = new Pryv.Connection(formApiEndpoint);
  const drAccessInfo = await drConnection.accessInfo();
  console.log('## Dr Form info', drAccessInfo);
  const questionaryId = drAccessInfo.clientData?.['demo-dr-form']?.questionaryId;
  const drUserId = drAccessInfo.user.username;

  const status = formEvent.streamIds[0];

  return {
    status,
    formApiEndpoint,
    questionaryId,
    drUserId,
    drConnection,
    created: new Date(drAccessInfo.created),
    formEvent,
    sharingAccessId: `${drUserId}-${questionaryId}`
  }
}


// ---------- connection to the pryv account ------------- //

let connection = null;

function getPatientApiEndpoint() {
  return connection.apiEndpoint;
}

function showLoginButton (loginSpanId, stateChangeCallBack) {
 
   const requestedPermissions = [{
     streamId: '*',
     level: 'manage',
   }];
 
   const authSettings = {
     spanButtonID: loginSpanId, // div id the DOM that will be replaced by the Service specific button
     onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
     authRequest: { // See: https://api.pryv.com/reference/#auth-request
       requestingAppId: 'demo-dr-form-patient', // to customize for your own app
       requestedPermissions,
       clientData: {
         'app-web-auth:description': {
           'type': 'note/txt',
           'content': 'This app allows manage form requests from doctors.\n It requires access to all your HDS account\s data. Still you will be able to manage what data to share with your doctor.',
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
       stateChangeCallBack('loggedIN');
     }
     if (state.id === Pryv.Browser.AuthStates.INITIALIZED) {
       connection = null;
       stateChangeCallBack('loggedOUT');
     }
   }
 }
 