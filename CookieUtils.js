export const CookieUtils = {
  get,
  set,
  del
};

/**
  * Set a local cookie
  * @memberof CookieUtils
  * @param {string} cookieKey - The key for the cookie
  * @param {mixed} value - The Value
  * @param {number} expireInDays - Expiration date in days from now
  * @param {string} path
  */
function set (cookieKey, value, expireInDays = 365, path) {
  expireInDays = expireInDays;
  const myDate = new Date();
  const hostName = window.location.hostname;
  const cookiePath = path || window.location.pathname;
  myDate.setDate(myDate.getDate() + expireInDays);
  let cookieStr = encodeURIComponent(cookieKey) + '=' +
    encodeURIComponent(JSON.stringify(value)) +
    ';path=' + cookiePath +
    ';expires=' + myDate.toGMTString() +
    ';domain=' + hostName ;
  // do not add SameSite when removing a cookie
  if (expireInDays >= 0) cookieStr += ';SameSite=Strict';
  document.cookie = cookieStr;
}

/**
 * Return the value of a local cookie
 * @memberof CookieUtils
 * @param cookieKey - The key
 */
function get (cookieKey) {
  const name = encodeURIComponent(cookieKey);
  const value = '; ' + document.cookie;
  const parts = value.split( name + '=');
  if (parts.length < 2) return null;
  const first = parts.pop().split(';').shift();
  return JSON.parse(decodeURIComponent(first));
}

/**
 * Delete a local cookie
 * @memberof CookieUtils
 * @param cookieKey - The key
 */
function del (cookieKey, path) {
  set(cookieKey, { deleted: true }, -1, path);
}