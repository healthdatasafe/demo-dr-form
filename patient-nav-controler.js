import { patientLib } from './patient-lib.js';

export const navControler = {
  setNavComponents
}

async function setNavComponents() {
  const navData = patientLib.navGetData();
  const {questionaryId, formKey} = navData;
  const navTable = document.getElementById('card-nav');
  navTable.innerHTML = '';
  for (const page of await patientLib.navGetPages(questionaryId)) {
    if (page.formKey === formKey) continue;
    navTable.innerHTML += `&nbsp;<A HREF="${page.url}" class="btn btn-primary">${page.label}</A>` ;
  }
  return navData;
}