/**
 * Logs into a GeoServer instance. Provide your username and password as
 * environment variables when running the script, i.e:
 * `GEOSEVER_USER=myuser GEOSEVER_PWD=mypassword npm start`
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
  browser.close();
  console.log('See screenshot: ' + screenshot);
})();
