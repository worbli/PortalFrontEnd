FROM keymetrics/pm2:latest-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
RUN npm install prpl-server
COPY build build/
COPY images images/
COPY package.json .
COPY ecosystem.config.js .
COPY --chown=node:node . .
USER node
EXPOSE 8080
RUN ls -al -R
CMD [ "pm2-runtime", "start", "ecosystem.config.js"]