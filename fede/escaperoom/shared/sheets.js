/* El Secuestro de Maxim — shared Google Sheets client.
   Same service-account pattern as fede/countdown/script.js (XOR-hex creds →
   jsrsasign RS256 JWT → token → Sheets v4 REST), generalized for several pages
   plus a values.update helper the older pages never needed.
   Requires: jsrsasign CDN script + shared/config.js loaded first. */

const ES = (() => {
  let credentials = null;
  let hexCache = null;
  let accessToken = null;
  let tokenExpiry = 0;

  const BASE = () =>
    'https://sheets.googleapis.com/v4/spreadsheets/' + ESC_CONFIG.SPREADSHEET_ID;

  function xorDecrypt(hex, key) {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
    const keyB = new TextEncoder().encode(key);
    const plain = bytes.map((b, i) => b ^ keyB[i % keyB.length]);
    return new TextDecoder().decode(plain);
  }

  async function init(password) {
    if (credentials) return true;
    if (!hexCache) {
      const res = await fetch(ESC_CONFIG.CREDENTIALS_FILE);
      if (!res.ok) throw new Error('credentials fetch failed: HTTP ' + res.status);
      hexCache = (await res.text()).trim();
    }
    const json = xorDecrypt(hexCache, password || ESC_CONFIG.PASSWORD);
    credentials = JSON.parse(json); // throws on wrong password
    return true;
  }

  async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpiry) return accessToken;
    if (!credentials) throw new Error('ES.init() first');

    const now = Math.floor(Date.now() / 1000);
    const jwt = KJUR.jws.JWS.sign(
      'RS256',
      JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
      JSON.stringify({
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3500,
        iat: now,
      }),
      credentials.private_key
    );
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt,
    });
    if (!res.ok) throw new Error('token exchange failed: ' + res.status);
    const data = await res.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;
    return accessToken;
  }

  async function getValues(range) {
    const token = await getAccessToken();
    const res = await fetch(BASE() + '/values/' + encodeURIComponent(range), {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!res.ok) throw new Error('read failed: ' + res.status);
    return (await res.json()).values || [];
  }

  async function appendRow(tab, row) {
    const token = await getAccessToken();
    const res = await fetch(
      BASE() + '/values/' + encodeURIComponent(tab + '!A1') +
        ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',
      {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [row] }),
      }
    );
    if (!res.ok) throw new Error('append failed: ' + res.status);
  }

  async function updateValues(range, values) {
    const token = await getAccessToken();
    const res = await fetch(
      BASE() + '/values/' + encodeURIComponent(range) + '?valueInputOption=USER_ENTERED',
      {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ range, values }),
      }
    );
    if (!res.ok) throw new Error('update failed: ' + res.status);
  }

  async function clearRange(range) {
    const token = await getAccessToken();
    const res = await fetch(BASE() + '/values/' + encodeURIComponent(range) + ':clear', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!res.ok) throw new Error('clear failed: ' + res.status);
  }

  /* state tab: key/value grid, column A key / column B value */
  async function readState() {
    const rows = await getValues(ESC_CONFIG.STATE_RANGE);
    const state = {};
    for (const r of rows) if (r[0] !== undefined) state[r[0]] = r[1] !== undefined ? r[1] : '';
    return state;
  }

  function stateCell(key) {
    const row = ESC_CONFIG.STATE_ROWS[key];
    if (!row) throw new Error('unknown state key: ' + key);
    return 'state!B' + row;
  }

  const setState = (key, value) => updateValues(stateCell(key), [[String(value)]]);

  /* One PUT covering contiguous rows starting at firstKey (order must match the tab). */
  function setStateBlock(firstKey, values) {
    const first = ESC_CONFIG.STATE_ROWS[firstKey];
    const range = 'state!B' + first + ':B' + (first + values.length - 1);
    return updateValues(range, values.map((v) => [String(v)]));
  }

  /* Poll wrapper: overlap guard + exponential backoff on failure. */
  function poll(intervalMs, fn, onError) {
    let busy = false;
    let delay = intervalMs;
    let timer = null;
    async function tick() {
      if (busy) return;
      busy = true;
      try {
        await fn();
        delay = intervalMs;
      } catch (e) {
        delay = Math.min(delay * 2, 60000);
        if (onError) onError(e);
      } finally {
        busy = false;
        timer = setTimeout(tick, delay);
      }
    }
    tick();
    return () => clearTimeout(timer);
  }

  function logEvent(source, event, detail) {
    appendRow('log', [new Date().toISOString(), source, event, detail || '']).catch(() => {});
  }

  return { init, getAccessToken, getValues, appendRow, updateValues, clearRange,
           readState, setState, setStateBlock, poll, logEvent };
})();
