FROM node:16.16.0

WORKDIR /app

COPY pricing_api pricing_api

RUN cd pricing_api; npm install; npm audit fix --force; npm link;

COPY home home

RUN cd home; npm install; npm link ../pricing_api;

CMD [ "node", "home/home.js" ]
