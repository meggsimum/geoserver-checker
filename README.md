# geoserver-checker

Script to check if a [GeoServer](http://geoserver.org) instance is up and running correctly.

## Use the script

### Prerequisites

  - Node.js and npm have to be installed on your system
  - Clone or download this repository
  - Open a terminal and navigate to the checkout / download
  - Install dependencies with `npm install`

### Execute the script

Check a GeoServer at http://localhost:9999/geoserver/ by performing a login to
the web inteface with GeoServer default credentials:

```bash
GEOSEVER_BASEURL=http://localhost:9999/geoserver/ \
npm start
```

Check a GeoServer at http://localhost:9999/geoserver/ by performing a login to
the web inteface with the given credentials:

```bash
GEOSEVER_BASEURL=http://localhost:9999/geoserver/ \
GEOSEVER_USER=kalle \
GEOSEVER_PWD=123456 \
npm start
```
Check a GeoServer at http://localhost:9999/geoserver/ by performing a login to
the web inteface with the given credentials and test if the given workspaces
exists in the GeoServer instance:

```bash
GEOSEVER_BASEURL='http://localhost:9999/geoserver/' \
GEOSEVER_USER=kalle \
GEOSEVER_PWD=123456 \
GEOSERVER_WS='ws_1,ws_2,ws_foo,ws_bar' \
npm start
```
