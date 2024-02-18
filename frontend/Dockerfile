FROM node:lts

WORKDIR /frontend
COPY . /frontend
RUN npm i
RUN npm run build

ENTRYPOINT ["npm", "start"]