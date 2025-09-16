import { dataDefs } from "./common-data-defs.js";
import { serviceInfoUrl, stateSaveApp } from "./common-lib.js"


// NEW
/** The "base" stream for this App */
const APP_MANAGING_STREAMID = 'app-dr-hds';
/** The name of this application */
const APP_MANAGING_NAME = 'HDS Dr App PoC';

export const drLib = {
  showLoginButton,
  getPatientsData,
  getPatientDetails
};

function showLoginButton (loginSpanId, stateChangeCallBack) {
  const authSettings = {
    spanButtonID: loginSpanId, // div id the DOM that will be replaced by the Service specific button
    onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
    authRequest: {
      // See: https://api.pryv.com/reference/#auth-request
      requestingAppId: APP_MANAGING_STREAMID, // to customize for your own app
      requestedPermissions: [
        {
          streamId: APP_MANAGING_STREAMID,
          defaultName: APP_MANAGING_NAME,
          level: "manage",
        },
      ],
      clientData: {
        'app-web-auth:ensureBaseStreams': [ // this is handled by custom app web Auth3 (might be migrated in permission request)
          { id: 'applications', name: 'Applications' },
          { id: APP_MANAGING_STREAMID, name: APP_MANAGING_NAME, parentId: 'applications' }
        ],
        "app-web-auth:description": {
          type: "note/txt",
          content:
            "This app allows to send invitation links to patients and visualize and export answers.",
        },
      },
    },
  };

  
  HDSLib.pryv.Browser.setupAuth(authSettings, serviceInfoUrl);

  async function pryvAuthStateChange(state) {
    // called each time the authentication state changes
    console.log("##pryvAuthStateChange", state);
    if (state.id === HDSLib.pryv.Browser.AuthStates.AUTHORIZED) {
      await HDSLib.initHDSModel(); // hds model needs to be initialized 
      const appManaging = await HDSLib.appTemplates.AppManagingAccount.newFromApiEndpoint(APP_MANAGING_STREAMID, state.apiEndpoint, APP_MANAGING_NAME);
      stateSaveApp('managing', appManaging);
      await initDemoAccount(appManaging);
      stateChangeCallBack("loggedIN");
    }
    if (state.id === HDSLib.pryv.Browser.AuthStates.INITIALIZED) {
      stateSaveApp('managing', null);
      stateChangeCallBack("loggedOUT");
    }
  }
}

/** 
 * Right after beeing logged in.
 * Check if the account has the two forms 
 * This step will be implemented in the dr's App when the "create form" will be developped
 * */
async function initDemoAccount (appManaging) {
  // name should be better than "username" - to be changed
  const drConnectionInfo = await appManaging.connection.accessInfo();
  const drUserName = drConnectionInfo.user.username;

  // -- check current collectors (forms)
  const collectors = await appManaging.getCollectors();
  for (const [questionaryId, questionary] of Object.entries(dataDefs.v2questionnaires)) {
    // check if collector exists
    const found = collectors.find(c => c.name === questionary.title);
    if (found) { 
      console.log('##2 initDemoAccount found', found);
      continue; // stop here if exists
    }
    console.log('##2 initDemoAccount creating collector for', questionary);
    const newCollector = await appManaging.createCollector(questionary.title);
    
    // create the request content 
    // 1- get all items form the questionnary sections
    const itemKeys = [];
    for (const formContent of Object.values(questionary.forms)) {
      itemKeys.push(...formContent.itemKeys);
    }
    // 2 - get the permissions with eventual preRequest 
    const preRequest = questionary.permissionsPreRequest || [];
    const permissions = HDSLib.getHDSModel().authorizations.forItemKeys(itemKeys, { preRequest });
    
    const requestContent = {
      version: '0',
      title: {
        en: questionary.title
      },
      requester: {
        name: 'Username ' + drUserName,
      },
      description: {
        en: 'Short Description to be updated: ' + questionary.title
      },
      consent: {
        en: 'This is a consent message to be set'
      },
      permissions,
      app: {
        id: 'dr-form',
        url: 'https://xxx.yyy',
        data: { // will be used by patient app
          forms: questionary.forms
        } 
      }
    };
    newCollector.request.setContent(requestContent);
    await newCollector.save(); // save the data (done when the form is edited)
    // await newCollector.publish(); console.log('##2 initDemoAccount published', newCollector);
  }
  console.log('##2 initDemoAccount with ', collectors);
}

// -------- Fetch patient list --------

async function getPatientsData (collector) {
  const requestContent = collector.request.content;
  console.log('## collector requestContent', requestContent);
  // static headers
  const headers = {
    status: 'Status',
    inviteName: 'Invite',
    username: 'Username',
    createdAt: 'Date'
  }
  // headers from first form 
  const firstSection = requestContent.sections[0];
  const itemDefs = [];
  for (const itemKey of firstSection.itemKeys) {
    const itemDef = HDSLib.getHDSModel().itemsDefs.forKey(itemKey);
    itemDefs.push(itemDef);
    headers[itemDef.key] = itemDef.label;
  }

  // add lines (1 per patient)
  const invites = await collector.getInvites(); 
  const activeInvites = invites.filter(i => i.status === 'active');
  

  // fetch patient data
  const patientPromises = activeInvites.map((invite) => 
    drLib.getPatientDetails(invite, itemDefs)
  );
  const patientsData = await Promise.all(patientPromises);
  patientsData.sort((a, b) => b.dateCreation - a.dateCreation); // sort by creation date reverse
  console.log('## patientsResults', patientsData);
  
  return { headers, patientsData }
}


/**
 * get patients details
 */
async function getPatientDetails(invite, itemDefs) {
  const patient = {
    invite,
    status: invite.status,
    username: null,
    inviteName: invite.displayName,
    createdAt: invite.dateCreation.toLocaleString(),
    dateCreation: invite.dateCreation // keep it as a date for sorting
  };
  console.log('## getPatientDetails.invite', invite, invite.status, invite.eventData.streamIds);

  // -- 
  const patientInfo = await invite.checkAndGetAccessInfo();
  if (patientInfo === null) return patient;
  patient.username = patientInfo.user.username;

  // -- get data
  
  // get the last value of each itemKey
  const apiCalls = itemDefs.map((itemDef) => {
    return {
      method: "events.get",
      params: {
        streams: [itemDef.data.streamId],
        types: itemDef.eventTypes,
        limit: 1,
      }
    };
  });

  const profileEventsResults = await invite.connection.api(apiCalls);
  for (const profileEventRes of profileEventsResults) {
    const profileEvent = profileEventRes?.events?.[0];
    if (!profileEvent) continue;
    const field = dataFieldFromEvent(profileEvent);
    patient[field.key] = ( field.value != null) ? field.value : '' ;
  }
  return patient;
}

/**
 * Link an event to a data field from form
 * @param {*} event
 */
function dataFieldFromEvent(event) {
  const itemDef = HDSLib.getHDSModel().itemsDefs.forEvent(event, false);
  if (!itemDef) {
    console.error("## itemDef not found for event", event);
    return null;
  }
  const field = {
    key: itemDef.key,
    label: itemDef.label,
    type: itemDef.data.type,
    value: event.content,
    event: event,
  };
  if (field.type === "date") {
    const date = new Date(event.content);
    if (!isNaN(date)) {
      field.value = date.toISOString().split("T")[0]; // format YYYY-MM-DD
    } else {
      console.error("## Error parsing date", event.content);
      field.value = "";
    }
  }
  return field;
}


