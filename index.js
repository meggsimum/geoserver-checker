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

// force other executable for chromium or chrome browser
const chromeExecPath = process.env.GS_CHECKER_CHROME_EXEC;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromeExecPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(geoserverBaseUrl + 'web').catch(() => {
    console.error('✘ Given URL could not be opened:', geoserverBaseUrl);
    process.exit(1);
  });
  await page.type('#username', user);
  await page.type('#password', pwd);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  await page.screenshot({
    path: screenshot
  });

  // check if login was scuccesfull by non existing error element in the UI
  if (await page.$('.feedbackPanelERROR') !== null) {
    console.error('✘ Login failed to GeoServer web interface.');
    process.exit(1);
  } else {
    console.info('✔ Sucessfully logged in to GeoServer web interface.');
    console.info('  Check screenshot after login: ', screenshot);
  }

  // check if expected workspaces are present (via GeoServer REST API)
  if (process.env.GS_CHECKER_WS) {
    const expectedWs = process.env.GS_CHECKER_WS.split(',');
    const fetch = require('node-fetch');

    const credentailsBase64 = Buffer.from(user + ':' + pwd).toString('base64');
    const authHeader = 'Basic ' + credentailsBase64;
    const headers = {
      Authorization: authHeader
    };
    const reqOptions = {
      method: 'GET',
      headers: headers
    };
    fetch(geoserverBaseUrl + 'rest/workspaces.json', reqOptions)
      .then(res => res.json()) // expecting a json response
      .then(json => {
        if (json.workspaces.workspace) {
          return json.workspaces.workspace.map(ws => ws.name)
        }
        return [];
      })
      .then(wsNames => {
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
      });
  }

  browser.close();
})();
