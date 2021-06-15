# geoserver-checker

Script to check if a [GeoServer](http://geoserver.org) instance is up and running correctly.

## Relevant ENV VARs

```
  - GS_CHECKER_BASEURL (defaults to 'http://localhost:8080/geoserver')
  - GS_CHECKER_USER (defaults to 'admin')
  - GS_CHECKER_PWD (defaults to 'geoserver')
  - GS_CHECKER_WS
  - GS_CHECKER_CHROME_EXEC
  - GS_CHECKER_NO_LOGIN (defaults to false)
```

## Use as Docker Container

```bash
docker run \
  -e GS_CHECKER_BASEURL=http://myhost:8080/geoserver/ \
  -e GS_CHECKER_USER=admin \
  -e GS_CHECKER_PWD=geoserver \
  meggsimum/geoserver-checker
```

## Use node Script directly

### Prerequisites

  - Node.js and npm have to be installed on your system
  - Clone or download this repository
  - Open a terminal and navigate to the checkout / download
  - Install dependencies with `npm install`

### Execute the script

Check a GeoServer at http://localhost:9999/geoserver/ by performing a login to
the web inteface with GeoServer default credentials:

```bash
GS_CHECKER_BASEURL=http://localhost:9999/geoserver/ \
npm start
```

Check a GeoServer at http://localhost:9999/geoserver/ by performing a login to
the web inteface with the given credentials:

```bash
GS_CHECKER_BASEURL=http://localhost:9999/geoserver/ \
GS_CHECKER_USER=kalle \
GS_CHECKER_PWD=123456 \
npm start
```
Check a GeoServer at http://localhost:9999/geoserver/ by performing a login to
the web inteface with the given credentials and test if the given workspaces
exists in the GeoServer instance:

```bash
GS_CHECKER_BASEURL='http://localhost:9999/geoserver/' \
GS_CHECKER_USER=kalle \
GS_CHECKER_PWD=123456 \
GS_CHECKER_WS='ws_1,ws_2,ws_foo,ws_bar' \
npm start
```
