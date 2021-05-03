FROM node:12.18.3 AS base

ENV DOCKERIZE_VERSION v0.6.0

RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
   && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
   && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN mkdir -p ~/app
WORKDIR ~/app

COPY package.json .
COPY yarn.lock .
COPY config.docker.js config.js

FROM base AS dependencies

RUN yarn install

FROM dependencies AS runtime

COPY . .
#RUN yarn lint # FIX LINT ERRORS
RUN yarn test:e2e
RUN yarn build
