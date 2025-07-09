import { patientLib } from './patient-lib2.js';

export const navControler = {
  setNavComponents
}

async function setNavComponents(collectorClient, formKey) {
  const navTable = document.getElementById('card-nav');
  navTable.innerHTML = '';
  for (const page of await patientLib.navGetPages(collectorClient)) {
    if (page.formKey === formKey) continue;
    navTable.innerHTML += `&nbsp;<A HREF="${page.url}" class="btn btn-primary">${page.label}</A>` ;
  }
}