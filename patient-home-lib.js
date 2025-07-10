import { serviceInfoUrl, stateSaveApp } from './common-lib.js';

export const patientHomeLib = {
  showLoginButton
}


// ---------- connection to the pryv account ------------- //

// NEW
const APP_CLIENT_NAME = 'HDS Patient app PoC';
const APP_CLIENT_STREAMID = 'app-client-dr-form'; // also used as "appId"


function showLoginButton (loginSpanId, stateChangeCallBack) {
 
   const requestedPermissions = [{
     streamId: '*',
     level: 'manage',
   }];
 
   const authSettings = {
     spanButtonID: loginSpanId, // div id the DOM that will be replaced by the Service specific button
     onStateChange: pryvAuthStateChange, // event Listener for Authentication steps
     authRequest: { // See: https://api.pryv.com/reference/#auth-request
       requestingAppId: APP_CLIENT_STREAMID, // to customize for your own app
       requestedPermissions,
       clientData: {
         'app-web-auth:description': {
           'type': 'note/txt',
           'content': 'This app allows manage form requests from doctors.\n It requires access to all your HDS account\s data. Still you will be able to manage what data to share with your doctor.',
         }
       },
     }
   };
 
   HDSLib.pryv.Browser.setupAuth(authSettings, serviceInfoUrl);
 
   async function pryvAuthStateChange(state) { // called each time the authentication state changes
     console.log('##pryvAuthStateChange', state);
     if (state.id === HDSLib.pryv.Browser.AuthStates.AUTHORIZED) {
       const appClient = await HDSLib.appTemplates.AppClientAccount.newFromApiEndpoint(APP_CLIENT_STREAMID, state.apiEndpoint, APP_CLIENT_NAME);
       stateSaveApp('client', appClient);
       stateChangeCallBack('loggedIN');
     }
     if (state.id === HDSLib.pryv.Browser.AuthStates.INITIALIZED) {
       stateSaveApp('client', null);
       stateChangeCallBack('loggedOUT');
     }
   }
 }
 