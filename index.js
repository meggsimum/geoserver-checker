/**
 * Performs checks against a GeoServer instance.
 * Provide your username and password as
 * environment variables when running the script, i.e:
 * `GEOSEVER_USER=myuser GEOSEVER_PWD=mypassword npm start` or inject the
 * URL to the GeoServer to test
 * `GEOSEVER_BASEURL=http://localhost:9999/geoserver/ npm start`
 *
 */
const puppeteer = require('puppeteer');
const screenshot = 'geoserver.png';

let geoserverBaseUrl;
if (process.env.GEOSEVER_BASEURL) {
  geoserverBaseUrl = process.env.GEOSEVER_BASEURL;
} else {
  const protocoll = process.env.GEOSEVER_PROTOCOLL || 'http';
  const host = process.env.GEOSEVER_HOST || 'localhost';
  const port = process.env.GEOSEVER_PORT || '8080';
  const path = process.env.GEOSEVER_PATH || 'geoserver';

  geoserverBaseUrl = 'http://' + host + ':' + port + '/' + path + '/';
}

console.info('---------------------------------------------------------------');
console.info('Checking GeoServer at: ', geoserverBaseUrl);
console.info('---------------------------------------------------------------');

const user = process.env.GEOSEVER_USER || 'admin';
const pwd = process.env.GEOSEVER_PWD || 'geoserver';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto(geoserverBaseUrl + 'web');
  await page.type('#username', user);
  await page.type('#password', pwd);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  await page.screenshot({ path: screenshot });

  // check if login was scuccesfull by non existing error element in the UI
  if (await page.$('.feedbackPanelERROR') !== null) {
    console.info('✘ Login failed to GeoServer web interface.');
    process.exit(1);
  } else {
    console.info('✔ Sucessfully logged in to GeoServer web interface.');
    console.info('  Check screenshot after login: ', screenshot);
  }

  if (process.env.GEOSERVER_WS) {
    const workspaces = process.env.GEOSERVER_WS.split(',');
    const fetch = require('node-fetch');

    const credentailsBase64 = Buffer.from(user + ':' + pwd).toString('base64');
    const authHeader = 'Basic ' + credentailsBase64;
    const headers = {'Authorization': authHeader};
    const reqOptions = {
      method: 'GET',
      headers: headers
    };
    fetch(geoserverBaseUrl + 'rest/workspaces.json', reqOptions)
      .then(res => res.json()) // expecting a json response
      .then(json => json.workspaces.workspace.map(ws => ws.name))
      .then(wsName => {
        // check if all expected workspaces are existing
        let wsNotFound = [];
        workspaces.forEach((wsToCheck) => {
          if (!wsName.includes(wsToCheck)) {
              wsNotFound.push(wsToCheck);
          }
        });

        if (wsNotFound.length > 0) {
          console.error('Missing workspace(s):', wsNotFound.join(', '));
          process.exit(1);
        } else {
          console.info('✔ Found all expected workspaces in GeoServer');
        }
      });
  }

  browser.close();
})();
