version: "3"

services:
  node:
    image: node:latest
    user: node
    working_dir: /home/node/app
    volumes:
      - ./:/home/node/app
    command: "npm start"
    ports:
      - 8080:80
    environment:
      PORT: 80
