import { CookieUtils } from './CookieUtils.js';
let model;

// following the APP GUIDELINES: https://api.pryv.com/guides/app-guidelines/
export const serviceInfoUrl = HDSLib.pryv.Browser.serviceInfoFromUrl() || "https://demo.datasafe.dev/reg/service/info";


// ---- state management to be replaced by framework logic

const apps = {
  client: null,
  managing: null
};

/**
 * 
 * @param {*} app -  AppClientAccount or AppManagingAccount (null to delete)
 * @param {string} type 'client' or 'managing'
 */
export function stateSaveApp (type, app) {
  console.log('## stateSaveApp ', app);
  const navData = app ? {
    apiEndpoint: app.connection.apiEndpoint,
    streamId: app.baseStreamId,
    name: app.appName
  } : null;
  stateSetData(navData, 'hds-app-' + type + '-app');
  apps[type] = app;
}

export async function stateGetApp (type) {
  if (apps[type]) return apps[type];
  const navData = stateGetData('hds-app-' + type  + '-app');
  if (navData !== null) {
    if (type === 'client') {
      apps.client = await HDSLib.appTemplates.AppClientAccount.newFromApiEndpoint(navData.streamId, navData.apiEndpoint, navData.name);
    } else {
      apps.managing = await HDSLib.appTemplates.AppManagingAccount.newFromApiEndpoint(navData.streamId, navData.apiEndpoint, navData.name);
    }
  }
  console.log('## stateGetApp ', type, apps[type]);
  return apps[type];
}


const COOKIE_KEY = 'hds-app-client-de';
export function stateSetData(data, cookieKey = COOKIE_KEY) {
  if (data == null) return CookieUtils.del(cookieKey, '/');
  CookieUtils.set(cookieKey, data, 365, '/');
  // debug 
  const debugData = stateGetData(cookieKey);
  console.log('## stateSetData ', {cookieKey, data, debugData});
}

export function stateGetData(cookieKey = COOKIE_KEY) {
  const cookieContent = CookieUtils.get(cookieKey);
  console.log('## stateGetData ', { cookieKey, cookieContent });
  const formKey = (new URLSearchParams(window.location.search)).get('formKey');
  return Object.assign({ formKey }, cookieContent);
}
