FROM node:latest

WORKDIR /app

COPY package.json /app

RUN npm

COPY . /app

EXPOSE 3000

CMD ["npm","start"]!