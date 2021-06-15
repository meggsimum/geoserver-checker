FROM node:13-alpine

ENV GS_CHECKER_BASEURL=$GS_CHECKER_BASEURL
ENV GS_CHECKER_USER=$GS_CHECKER_USER
ENV GS_CHECKER_PWD=$GS_CHECKER_PWD
ENV GS_CHECKER_WS=$GS_CHECKER_WS

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
ENV CHROME_BIN="/usr/bin/chromium-browser"
ENV GS_CHECKER_CHROME_EXEC="/usr/bin/chromium-browser"

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

WORKDIR /opt

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index.js" ]
