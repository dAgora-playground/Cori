FROM node:16.17.0

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
RUN npm install ts-node -g

COPY . .

EXPOSE 3000
CMD [ "npm", "run", "start" ]