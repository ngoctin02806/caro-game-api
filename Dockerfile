FROM node:15.3.0-alpine3.10

WORKDIR /opt/node-app

ENV PORT=8000
ENV MONGO_URL=mongodb://mongo:27017/caro-game

COPY ./package*.json ./

RUN npm install --production

COPY ./src ./

EXPOSE 8000

CMD [ "node", "src/bootstrap.js" ]