import { dataDefs } from "./common-data-defs.js";
import { connectAPIEndpoint, hdsModel, serviceInfoUrl } from "./common-lib.js"

// OLD
const appDrStreamId = dataDefs.appId + "-dr"; // simply use the appId + '-dr'
let drConnection = null;

// NEW
/** The "base" stream for this App */
const APP_MANAGING_STREAMID = 'app-dr-hds';
/** The name of this application */
const APP_MANAGING_NAME = 'HDS Dr App PoC';
/** The app Manging */
let appManaging; // initalized during pryvAuthStateChange

export const drLib = {
  // OK for v2
  showLoginButton,
  getAppManaging,
  // OLD
  getSharingToken,
  getPatientsList,
  getFirstFormFields
};

/**
 * exposes appManaging for the app 
 */
function getAppManaging () {
  return appManaging;
}

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
      await initDemoAccount(state.apiEndpoint);
      stateChangeCallBack("loggedIN");
    }
    if (state.id === HDSLib.pryv.Browser.AuthStates.INITIALIZED) {
      drConnection = null;
      appManaging = null;
      stateChangeCallBack("loggedOUT");
    }
  }
}

/** 
 * Right after beeing logged in.
 * Check if the account has the two forms 
 * This step will be implemented in the dr's App when the "create form" will be developped
 * */
async function initDemoAccount (apiEndpoint) {
  drConnection = await connectAPIEndpoint(apiEndpoint);
  const drConnectionInfo = await drConnection.accessInfo();
  console.log('## initDemoAccount - drConnectionInfo', drConnectionInfo);
  appManaging = await HDSLib.appTemplates.AppManagingAccount.newFromConnection(APP_MANAGING_STREAMID, drConnection);

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
    const permissions = hdsModel().authorizations.forItemKeys(itemKeys, { preRequest });
    
    const requestContent = {
      version: '0',
      title: {
        en: questionary.title
      },
      requester: {
        name: 'Username ' + drConnectionInfo.user.username
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
    newCollector.statusData.requestContent = requestContent;
    await newCollector.save(); // save the data (done when the form is edited)
    await newCollector.publish();
    console.log('##2 initDemoAccount published', newCollector);
  }
  console.log('##2 initDemoAccount with ', collectors);
}

// -------- Fetch patient list --------

const patients = {};

async function getPatientsList(questionaryId, limit = 100) {
  const qStreams = questionnaryStreams(questionaryId);
  const res = await drConnection.api([
    {
      method: "events.get",
      params: {
        types: ["credentials/pryv-api-endpoint"],
        limit,
        streams: [qStreams.questionnary.id],
      },
    },
  ]);
  const patientApiEndpointEvents = res[0].events;

  // -- remove duplicates
  const duplicateEventId = [];
  const uniques = {};
  for (const patientEvent of patientApiEndpointEvents) {
    if (patientEvent.type === "credentials/pryv-api-endpoint") {
      const apiEndpoint = patientEvent.content;
      if (uniques[apiEndpoint]) {
        // -- duplicate
        duplicateEventId.push(patientEvent.id);
        console.log("## Duplicate patient event", patientEvent);
      } else {
        uniques[apiEndpoint] = patientEvent;
      }
    }
  }
  if (duplicateEventId.length > 0) {
    const removeDuplicatesApiCalls = duplicateEventId.map((id) => ({
      method: "events.delete",
      params: { id },
    }));
    const removeDuplicates = await drConnection.api(removeDuplicatesApiCalls);
    console.log("## Removed duplicates", removeDuplicates);
  }

  // -- get the patients
  const patientPromises = Object.values(uniques).map((patientEvent) =>
    getPatientDetails(questionaryId, patientEvent)
  );
  const patientsResults = await Promise.all(patientPromises);

  const patients = {};
  for (const patient of patientsResults) {
    if (patient) {
      patients[patient.apiEndpoint] = patient;
      console.log("## Patient details", patient);
    }
  }

  console.log("## Patients list", patients);
  return patients;
}

/**
 * get patients details
 */
async function getPatientDetails(questionaryId, patientEvent) {
  // -- check if the event is a patient event
  const qStreams = questionnaryStreams(questionaryId);
  if (patientEvent.type !== "credentials/pryv-api-endpoint") return null;
  const patient = {
    status: "active",
    apiEndpoint: patientEvent.content,
    formData: {},
  };
  const patientConnection = await connectAPIEndpoint(patient.apiEndpoint);

  // -- get patient data
  if (!patientEvent.streamIds.includes(qStreams.revoked)) {
    // -- get patient info
    try {
      const patientInfo = await patientConnection.accessInfo();
      patient.username = patientInfo.user.username;
    } catch (e) {
      console.error("## Error getting patient info: " + patient.apiEndpoint, e);
      // -- mark as revoked
      const revokeRequest = await drConnection.api([
        {
          method: "events.update",
          params: {
            id: patientEvent.id,
            update: {
              streamIds: [qStreams.revoked],
            },
          },
        },
      ]);
      console.log("## Patient marked as revoked", revokeRequest);
      patientEvent.streamIds = [qStreams.revoked];
    }
  }

  // -- marked revoked
  if (patientEvent.streamIds.includes(qStreams.revoked)) {
    patient.status = "revoked";
    const usernameFromApiEndpoint = patientEvent.content.split("/")[3];
    patient.username =
      patientEvent.clientData?.username || usernameFromApiEndpoint;
    return patient;
  }

  // -- get data
  // get profile form data
  const formProfile = dataDefs.v2questionnaires[questionaryId].forms.profile;


  // get the last value of each itemKey
  const apiCalls = formProfile.itemKeys.map((itemKey) => {
    const itemDef = hdsModel().itemsDefs.forKey(itemKey);
    return {
      method: "events.get",
      params: {
        streams: [itemDef.data.streamId],
        types: itemDef.eventTypes,
        limit: 1,
      }
    };
  });

  const profileEventsResults = await patientConnection.api(apiCalls);
  for (const profileEventRes of profileEventsResults) {
    const profileEvent = profileEventRes?.events?.[0];
    if (!profileEvent) continue;
    const field = dataFieldFromEvent(profileEvent);
    patient.formData[field.key] = field;
  }
  return patient;
}

/**
 * get the list of rows for the initial table
 */
function getFirstFormFields(questionaryId) {
  const forms = dataDefs.v2questionnaires[questionaryId].forms;
  const firstForm = Object.values(forms)[0];
  const itemDefs = [];
  for (const itemKey of firstForm.itemKeys) {
    itemDefs.push(hdsModel().itemsDefs.forKey(itemKey));
  }
  
  return itemDefs;
}

/**
 * Link an event to a data field from form
 * @param {*} event
 */
function dataFieldFromEvent(event) {
  const itemDef = hdsModel().itemsDefs.forEvent(event, false);
  if (!itemDef) {
    console.error("## itemDef not found for event", event);
    return null;
  }
  const field = {
    key: itemDef.key,
    label: itemDef.data.label.en,
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

// -------- questionnary streams ---- //
function questionnaryStreams(questionaryId) {
  const questionnaryStreamId = appDrStreamId + "-" + questionaryId;
  return {
    questionnary: { id: questionnaryStreamId, name: questionaryId },
    inbox: {
      id: questionnaryStreamId + "-inbox",
      name: questionaryId + " Inbox",
    },
    revoked: {
      id: questionnaryStreamId + "-revoked",
      name: questionaryId + " Revoked",
    },
  };
}

// -------- init functions -------- //

/**
 * Initialize or get the sharing token for patients
 * @returns
 */
async function getSharingToken(questionaryId) {
  const sharedAccessId = dataDefs.appId + "-" + questionaryId;
  const accessesCheckRes = await drConnection.api([
    { method: "accesses.get", params: {} },
  ]);
  const sharedAccess = accessesCheckRes[0].accesses.find(
    (access) => access.name === sharedAccessId
  );

  const qStreams = questionnaryStreams(questionaryId);

  if (sharedAccess) {
    console.log("## Dr account already has a shared access");
    return sharedAccess.apiEndpoint;
  }
  // make sure streams for questionary Exists

  const resultStreamAndAccess = await drConnection.api([
    {
      method: "streams.create", // make sure streamId with sharedAccessId exists
      params: {
        id: qStreams.questionnary.id,
        name: qStreams.questionnary.name,
        parentId: appDrStreamId,
      }
    },
    {
      method: "streams.create",
      params: {
        id: qStreams.inbox.id,
        name: qStreams.inbox.name,
        parentId: qStreams.questionnary.id,
      }
    },
    {
      method: "streams.create",
      params: {
        id: qStreams.revoked.id,
        name: qStreams.revoked.name,
        parentId: qStreams.questionnary.id,
      }
    },
    {
      // create access
      method: "accesses.create",
      params: {
        name: sharedAccessId,
        type: "shared",
        permissions: [
          {
            streamId: qStreams.inbox.id,
            level: "create-only",
          },
          {
            // for "publicly shared access" always forbid the selfRevoke feature
            feature: "selfRevoke",
            setting: "forbidden",
          },
          {
            // for "publicly shared access" always forbid the selfAudit feature
            feature: "selfAudit",
            setting: "forbidden",
          },
        ],
        clientData: {
          [dataDefs.appId]: {
            questionaryId,
            inboxStreamId: qStreams.inbox.id,
          }
        }
      }
    },
  ]);
  console.log("## Dr account shared access created", resultStreamAndAccess);
  return resultStreamAndAccess[3].access.apiEndpoint;
}
