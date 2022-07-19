'use strict';

const express = require('express');
const { Server } = require('ws');
const mongoose = require("mongoose");
const Data = require("./models/data");
const seedDB = require("./seeds");
const path = require('path');

// Set up default mongoose connection
const host = process.env.HOST || "mongodb://localhost:27017/websocket";
mongoose.connect(host, { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
  if (err) {
    console.log("Connection error to database")
  } else {
    console.log("Connected to database")
  }
});
// Get the default connection
var db = mongoose.connection;
// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Seed the database
seedDB();

const PORT = process.env.PORT || 80;
const PORTWS = process.env.PORTWS || 3000;
const INDEX = '/README.md';

const app = express();

// Catch all other routes to serve the client
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + INDEX));
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

const server = express()
  .listen(PORTWS, () => console.log(`Listening on ${PORTWS}`));

const wss = new Server({ server });

var imu = [];
var counter = 0;

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
  Data.findOne({}, function (err, data) {
    imu = data.imu;
  });
});

wss.on('connection', function connection(ws) {
  var state;
  Data.findOne({}, function (err, data) {
    state = data.state;
  });
  ws.on('message', function incoming(data) {
    switch (data) {
      case "power":
        Data.findOne({}, function (err, data) {
          state = data.state;
        });
        if (state) {
          ws.send((Math.random() * 1000).toFixed(2));
        } else {
          ws.send(0);
        }
        break;
      case "on":
        state = true;
        Data.updateOne({}, { state }, function (err, res) {
          if (err) throw err;
          console.log("Updated state to on.");
          ws.send(state.toString());
        });
        break;
      case "off":
        state = false;
        Data.updateOne({}, { state }, function (err, res) {
          if (err) throw err;
          console.log("Updated state to off.");
          ws.send(state.toString());
          ws.close();
        });
        break;
      case "state":
        Data.findOne({}, function (err, data) {
          state = data.state;
          ws.send(state.toString());
        });
        break;
      case "imu":
        if (state) {
          setInterval(() => {
            ws.send(imu[counter].toString());
            counter++;
            if (counter >= imu.length) {
              counter = 0;
            }
          }, 100);
        }
        break;
    }
  });
});
