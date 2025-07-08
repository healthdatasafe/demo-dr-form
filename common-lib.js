let model;

// following the APP GUIDELINES: https://api.pryv.com/guides/app-guidelines/
export const serviceInfoUrl = HDSLib.pryv.Browser.serviceInfoFromUrl() || "https://demo.datasafe.dev/reg/service/info";

export function hdsModel () {
  if (!model) { throw new Error('Initialize model with `initHDSModel()` first') };
  return model;
}

export async function initHDSModel () {
  if (!model) {
    console.log(HDSLib);
    const service = new HDSLib.pryv.Service(serviceInfoUrl);
    const serviceInfo = await service.info();
    model = new HDSLib.HDSModel(serviceInfo.assets['hds-model']);
    console.log('## model:', model);
    await model.load();
  }
  return model;
}

/**
 * Return HDSLib.pryv.Connection with property HDSModel Loaded
 * @param {string} apiEndpoint 
 * @returns 
 */
export async function connectAPIEndpoint (apiEndpoint) {
  const connection = new HDSLib.pryv.Connection(apiEndpoint);
  connection.hdsModel = await initHDSModel();
  return connection;
}
