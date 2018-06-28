FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY src ./src
COPY .babelrc .
COPY webpack* .
COPY config.docker.js ./config.js

EXPOSE 3000
EXPOSE 4444
CMD [ "npm", "run", "all" ]
