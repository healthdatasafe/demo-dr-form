let model;

// following the APP GUIDELINES: https://api.pryv.com/guides/app-guidelines/
export const serviceInfoUrl = Pryv.Browser.serviceInfoFromUrl() || "https://demo.datasafe.dev/reg/service/info";

export function hdsModel () {
  if (!model) { throw new Error('Initialize model with `initHDSModel()` first') };
  return model;
}

export async function initHDSModel () {
  if (!model) {
    const service = new Pryv.Service(serviceInfoUrl);
    const serviceInfo = await service.info();
    const model = new HDSLib.HDSModel(serviceInfo.assets['hds-model']);
    await model.load();
  }
  return model;
}

/**
 * Return Pryv.Connection with property HDSModel Loaded
 * @param {string} apiEndpoint 
 * @returns 
 */
export async function connectAPIEndpoint (apiEndpoint) {
  const connection = new Pryv.Connection(apiEndpoint);
  connection.hdsModel = await initHDSModel();
  return connection;
}
