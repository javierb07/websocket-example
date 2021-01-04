'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

var state = 0;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    console.log(data);
    switch(data) {
      case "power":
        ws.send((Math.random()*1000).toFixed(2));
        break;
      case "on":
        state = 1;
        break;
      case "off":
        state = 0;
        break;
      case "toggle":
        state = !state;
        break;
      case "state":
        ws.send(state);
        break;
    }
  });
});