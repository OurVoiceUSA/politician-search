
import storage from 'react-native-storage-wrapper';
import { wsbase } from './config';

const JWT = 'OV_JWT';

export function _specificAddress(address) {
  if ((address.match(/,/g) || []).length <= 2) return false;
  return true;
}

export function _partyNameFromKey(party) {
  switch (party) {
    case 'D': return 'Democrat';
    case 'R': return 'Republican';
    case 'I': return 'Independent';
    case 'G': return 'Green';
    case 'L': return 'Libertarian';
    default: return '';
  }
}

function _UserAgent() {
  return 'OurVoiceWeb/1.0 (React.js fetch)';
}

export async function _getApiToken() {
  var jwt = await storage.get(JWT);

  if (!jwt) {
    let res = await fetch(wsbase+'/auth/jwt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': _UserAgent(),
      },
      body: JSON.stringify({apiKey: 'OURVOICEUSAWEBAPP'})
    });
    jwt = JSON.parse(await res.text()).jwt;
    _saveJWT(jwt);
  }
  return jwt;
}

export async function _apiCall(uri, input) {
  let res;
  let jwt;
  let retry = false;

  do {
    jwt = await _getApiToken();

    try {
      res = await fetch(wsbase+uri, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer '+jwt,
          'Content-Type': 'application/json',
          'User-Agent': _UserAgent(),
        },
        body: JSON.stringify(input),
      });
    } catch (e) {
      res = {status: 500};
    }

    if (res.status !== 200) {
      if (retry) break; // don't retry again
      await _rmJWT();
      retry = true;
    } else {
      retry = false;
    }

  } while (retry);

  return res;
}

export async function _saveJWT(jwt) {
  try {
    await storage.set(JWT, jwt);
  } catch (error) {
    console.warn(error);
  }
}

export async function _rmJWT() {
  try {
    await storage.del(JWT);
  } catch (error) {
    console.warn(error);
  }
}

