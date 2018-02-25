const crypto = require('crypto');

/**
 * This method is used to create the Authorization header needed for requests to twitter. It follows the process described
 * here: https://developer.twitter.com/en/docs/basics/authentication/guides/authorizing-a-request and
 * here: https://developer.twitter.com/en/docs/basics/authentication/guides/creating-a-signature
 * @param {string} method - the method for the request
 * @param {string} url - the url to send the request to
 * @param {URLSearchParams} searchParams - the query search parameters to be used to the request
 * @returns {Promise<string>}
 */
async function createAuthorizationHeader({method, url, searchParams}) {

  const version = '1.0';
  const signatureMethod = 'HMAC-SHA1';
  const nonce = await createNonce();
  console.log(nonce);
  console.log('* ');
  const timestamp = Date.now().toString();

  const arrayOfParameters = [];
  for(let [key, value] of searchParams.entries()) {
    arrayOfParameters.push([fixedEncodeURIComponent(key),fixedEncodeURIComponent(value)]);
  }

  arrayOfParameters.push([fixedEncodeURIComponent('oauth_consumer_key'), fixedEncodeURIComponent(process.env.CONSUMER_KEY)]);
  arrayOfParameters.push([fixedEncodeURIComponent('oauth_nonce'), fixedEncodeURIComponent(nonce)]);
  arrayOfParameters.push([fixedEncodeURIComponent('oauth_version'), fixedEncodeURIComponent(version)]);
  arrayOfParameters.push([fixedEncodeURIComponent('oauth_signature_method'), fixedEncodeURIComponent(signatureMethod)]);
  arrayOfParameters.push([fixedEncodeURIComponent('oauth_timestamp'), fixedEncodeURIComponent(timestamp)]);
  arrayOfParameters.push([fixedEncodeURIComponent('oauth_token'), fixedEncodeURIComponent(process.env.ACCESS_TOKEN)]);
  arrayOfParameters.sort((a,b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  const parameterString = arrayOfParameters.reduce(
    (acc, curr, index) => acc.concat(`${curr[0]}=${curr[1]}${index!== arrayOfParameters.length-1?'&':''}`),
    ''
  );
  console.log(arrayOfParameters);
  console.log(parameterString);
  console.log('* ');

  const signatureBaseString = `${fixedEncodeURIComponent(method.toUpperCase())}&${fixedEncodeURIComponent(url)}&${fixedEncodeURIComponent(parameterString)}`;
  console.log(signatureBaseString);
  console.log('* ');

  const signingKey = `${fixedEncodeURIComponent(process.env.CONSUMER_SECRET)}&${fixedEncodeURIComponent(process.env.ACCESS_SECRET)}`;
  console.log(signingKey);
  console.log('* ');
  const hmac = crypto.createHmac('sha1', signingKey);
  hmac.write(signatureBaseString);
  const signature = hmac.digest('base64');
  hmac.end();

  return `OATH ${fixedEncodeURIComponent('oauth_consumer_key')}="${fixedEncodeURIComponent(process.env.CONSUMER_KEY)}", ` +
    `${fixedEncodeURIComponent('oauth_nonce')}="${fixedEncodeURIComponent(nonce)}", ` +
    `${fixedEncodeURIComponent('oauth_signature')}="${fixedEncodeURIComponent(signature)}", ` +
    `${fixedEncodeURIComponent('oauth_signature_method')}="${fixedEncodeURIComponent(signatureMethod)}", ` +
    `${fixedEncodeURIComponent('oauth_timestamp')}="${fixedEncodeURIComponent(timestamp)}", ` +
    `${fixedEncodeURIComponent('oauth_token')}="${fixedEncodeURIComponent(process.env.ACCESS_TOKEN)}", ` +
    `${fixedEncodeURIComponent('oauth_version')}="${fixedEncodeURIComponent(version)}"`;
}

/**
 * Creates a 32 alphanumeric character nonce
 * @returns {string}
 */
function createNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * encodeURIComponent wrapper which follows RFC 3986 more strictly.
 * Taken from here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 * @param {string} str
 * @returns {string}
 */
const fixedEncodeURIComponent = (str) => encodeURIComponent(str).replace(/[!'()*]/g, c =>`%${c.charCodeAt(0).toString(16)}`);

/**
 * Initial attempt to create a nonce generating method by using random binary data.
 * @returns {Promise<string>}
 */
function createBinaryNonce() {
  return new Promise ((resolve, reject) => {
    crypto.randomBytes(32, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString('base64'));
    });
  });
}

module.exports = {
  createAuthorizationHeader
};
