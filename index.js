'use strict';

const express = require('express');
const { Server } = require('ws');
const mongoose = require("mongoose");
const Data = require("./models/data");
const seedDB = require("./seeds");

// Set up default mongoose connection
const host = process.env.HOST || "mongodb://localhost:27017/websocket";
mongoose.connect(host,{ useNewUrlParser: true ,useUnifiedTopology: true}, function(err){
    if (err){
        console.log("Conection error to database")
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

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

var imu = [];
var counter = 0;

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
  Data.findOne({}, function(err, data){
    imu = data.imu;
 }); 
});

wss.on('connection', function connection(ws) {
  var state;
  Data.findOne({}, function(err, data){
     state = data.state;
  });
  ws.on('message', function incoming(data) {
    switch(data) {
      case "power":
        Data.findOne({}, function(err, data){
          state = data.state;
        });
        if(state){
          ws.send((Math.random()*1000).toFixed(2));
        } else {
          ws.send(0);
        }
        break;
      case "on":
        state = true;
        Data.updateOne({},{state: state}, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
        });
        break;
      case "off":
        state = false;
        Data.updateOne({},{state: state}, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
        });
        break;
      case "toggle":
        Data.updateOne({},{state: !state}, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
        });
        break;
      case "state":
        Data.findOne({}, function(err, data){
          state = data.state;
          ws.send(state.toString());
        });
        break;
    }
  });
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(imu[counter].toString());
    counter++;
    if(counter>=imu.length){ 
      counter = 0;
    }
  });
}, 100);