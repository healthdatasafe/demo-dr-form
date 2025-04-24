/**
 * UI management code. 
 * Relies on drLib for API calls and data management
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
  } else {
    document.getElementById('please-login').style.visibility = 'visible';
    document.getElementById('data-view').style.visibility = 'hidden';
  }
}
