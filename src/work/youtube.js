import * as fs from 'fs';
import * as readline from 'readline';
import * as google from 'googleapis';
import googleAuth from 'google-auth-library';

// If modifying these scopes, delete your previously saved credentials

let SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
let TOKEN_PATH = TOKEN_DIR + 'google-apis-nodejs-quickstart.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

function authorize(credentials, requestData, callback, callback2) {
  let clientSecret = credentials.installed.client_secret;
  let clientId = credentials.installed.client_id;
  let redirectUrl = credentials.installed.redirect_uris[0];
  let auth = new googleAuth();
  let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      if (typeof requestData !== 'function') {
        getNewToken(oauth2Client, requestData, callback, callback2);
      } else {
        getNewToken(oauth2Client, requestData);
      }
    } else {
      if (typeof requestData === 'function') {
        return requestData();
      }
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, requestData, callback2);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */

function getNewToken(oauth2Client, requestData, callback, callback2) {
  let authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app for YouTube Data API by visiting this url: ', authUrl);
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      if (typeof requestData === 'function') {
        return requestData();
      } else {
        callback(oauth2Client, requestData, callback2);
      }
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (error) => {
    if (error) {
      console.log('Error in storing file to ' + TOKEN_PATH);
    } else {
      console.log('Token stored to ' + TOKEN_PATH);
    }
  });
}

/**
 * Remove parameters that do not have values.
 *
 * @param {Object} params A list of key-value pairs representing request
 *                        parameters and their values.
 * @return {Object} The params object minus parameters with no values set.
 */

function removeEmptyParameters(params) {
  for (let p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
}

/**
 * Create a JSON object, representing an API resource, from a list of
 * properties and their values.
 *
 * @param {Object} properties A list of key-value pairs representing resource
 *                            properties and their values.
 * @return {Object} A JSON object. The function nests properties based on
 *                  periods (.) in property names.
 */
function createResource(properties) {
  let resource = {};
  let normalizedProps = properties;
  for (let p in properties) {
    let value = properties[p];
    if (p && p.substr(-2, 2) == '[]') {
      let adjustedName = p.replace('[]', '');
      if (value) {
        normalizedProps[adjustedName] = value.split(',');
      }
      delete normalizedProps[p];
    }
  }
  for (let p in normalizedProps) {
    // Leave properties that don't have values out of inserted resource.
    if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
      let propArray = p.split('.');
      let ref = resource;
      for (let pa = 0; pa < propArray.length; pa++) {
        let key = propArray[pa];
        if (pa == propArray.length - 1) {
          ref[key] = normalizedProps[p];
        } else {
          ref = ref[key] = ref[key] || {};
        }
      }
    };
  }
  return resource;
}

function videosListById(auth, requestData, callback) {
  let service = google.youtube('v3');
  let parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;
  service.videos.list(parameters, function(err, response) {
    if (err) {
      console.log('The YouTube Data API returned an error: ' + err);
      return;
    }
    // There may be removed videos so check for the length
    if (response.items.length > 0) {
      console.log(response.items[0].snippet.title);
    }
    return callback();
  });
}

export {authorize, videosListById};
