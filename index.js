/**
 * Performs checks against a GeoServer instance.
 * Provide your username and password as
 * environment variables when running the script, i.e:
 * `GS_CHECKER_USER=myuser GS_CHECKER_PWD=mypassword npm start` or inject the
 * URL to the GeoServer to test
 * `GS_CHECKER_BASEURL=http://localhost:9999/geoserver/ npm start`
 *
 */
const puppeteer = require('puppeteer');
const screenshot = 'geoserver.png';

const geoserverBaseUrl =
  process.env.GS_CHECKER_BASEURL || 'http://localhost:8080/geoserver';

console.info('---------------------------------------------------------------');
console.info('Checking GeoServer at: ', geoserverBaseUrl);
console.info('---------------------------------------------------------------');

const user = process.env.GS_CHECKER_USER || 'admin';
const pwd = process.env.GS_CHECKER_PWD || 'geoserver';
// flag to skip testing parts, which need authentication
const noLogin = process.env.GS_CHECKER_NO_LOGIN === 'true';

// force other executable for chromium or chrome browser
const chromeExecPath = process.env.GS_CHECKER_CHROME_EXEC;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: chromeExecPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // check for failed page.goto calls, e.g. HTTP 404
  page.on('response', response => {
    if (response.status() >= 400) {
      console.error('✘ Given URL', response.url(),
        'returned non 200 response code:', response.status());
      process.exit(1);
    }
  });

  try {
    await page.goto(geoserverBaseUrl + 'web');
  } catch (error) {
    console.error('✘ Given URL could not be opened:', geoserverBaseUrl);
    process.exit(1);
  }

  if (noLogin) {
    console.info('Done... skip parts needing authentication due to ' +
        'flag GS_CHECKER_NO_LOGIN=true');
    process.exit(0);
  }

  await page.type('#username', user);
  await page.type('#password', pwd);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  await page.screenshot({
    path: screenshot
  });

  // check if login was successful by non existing error element in the UI
  if (await page.$('.feedbackPanelERROR') !== null) {
    console.error('✘ Login failed to GeoServer web interface.');
    process.exit(1);
  } else {
    console.info('✔ Successfully logged in to GeoServer web interface.');
    console.info('  Check screenshot after login: ', screenshot);
  }

  // check if expected workspaces are present (via GeoServer REST API)
  if (process.env.GS_CHECKER_WS) {
    const expectedWs = process.env.GS_CHECKER_WS.split(',');
    const fetch = require('node-fetch');

    const credentialsBase64 = Buffer.from(user + ':' + pwd).toString('base64');
    const authHeader = 'Basic ' + credentialsBase64;
    const headers = {
      Authorization: authHeader
    };
    const reqOptions = {
      method: 'GET',
      headers: headers
    };

    const wsUrl = geoserverBaseUrl + 'rest/workspaces.json';
    const res = await fetch(wsUrl, reqOptions);
    const json = await res.json();

    let wsNames = [];
    if (json.workspaces.workspace) {
      wsNames = json.workspaces.workspace.map(ws => ws.name)
    }
    // check if all expected workspaces are existing
    const wsNotFound = [];
    if (wsNames) {
      expectedWs.forEach((wsToCheck) => {
        if (!wsNames.includes(wsToCheck)) {
          wsNotFound.push(wsToCheck);
        }
      });
    }

    if (wsNotFound.length > 0) {
      console.error('✘ Missing workspace(s):', wsNotFound.join(', '));
      process.exit(1);
    } else {
      console.info('✔ Found all expected workspaces in GeoServer');
    }
  }

  browser.close();
})();
