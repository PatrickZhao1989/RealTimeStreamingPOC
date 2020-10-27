FROM node:12.18.4-alpine
WORKDIR /usr/src/app

COPY package*.json ./

#RUN npm install
# If you are building your code for production
RUN npm ci

# Bundle app source
COPY src ./src
COPY tsconfig.json ./tsconfig.json

RUN npm run build:prod

# Debug only
COPY output-file ./output-file

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
