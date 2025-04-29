/**
 * UI management code. 
 * Relies on drLib for API calls and data management
 * Used to seprate the UI from the API calls
 * @param {*} event 
 */



window.onload = (event) => {
  stateChange('loggedOut');
  drLib.showLoginButton('login-button', stateChange);
};

function stateChange(state) {
  if (state === 'loggedIN') {
    document.getElementById('please-login').style.visibility = 'hidden';
    document.getElementById('data-view').style.visibility = 'visible';
    setSharingLink();
  } else {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('data-view').style.visibility = 'hidden';
  }
}

async function setSharingLink() {
  

  const currentPage = window.location.href;
  const posDrHTML = currentPage.indexOf('dr.html');
  const patientURL = currentPage.substring(0, posDrHTML) + 'patient.html';

  const formApiEndpoint = await drLib.getSharingToken();
  const sharingLink = patientURL + '?formApiEndpoint=' + formApiEndpoint;
  const sharingMailBody = 'Hello,\n\nI am sending you a link to fill out a form.\nPlease click on the link below to access the form: \n\n' + sharingLink + '\n\nBest regards,\nYour Doctor';
  const sharingLinkHTML = `<A HREF="mailto:?subject=Invitation&body=${encodeURI(sharingMailBody)}">Send by email</A> - ${sharingLink}`;
  document.getElementById('sharing-link').innerHTML = sharingLinkHTML;
}