'use strict';

require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const ms = require('mediaserver');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();

const cors = require('cors');
const { CLIENT_ORIGIN, DATABASE_URL, PORT } = require('./config');

const corsOptions = {
  origin: CLIENT_ORIGIN,
  optionsSuccessStatus: 200
};

const usersRouter = require('./routes/users');
const scenesRouter = require('./routes/scenes');
const audioRouter = require('./routes/audio');
const { localStrategy, jwtStrategy } = require('./strategies');

app.use(cors());

passport.use(localStrategy);
passport.use(jwtStrategy);

function setHeaders(res, path) {
  res.setHeader('content-type', 'audio/mpeg');
  res.setHeader('content-range', 'bytes 1779609-1779609/8945229');
  res.setHeader('content-length', 1);
}

app.use('/users', usersRouter);
app.use('/scenes', scenesRouter);
app.use('/audio', audioRouter);

app.use(express.static('public'));

// app.get('/:mp3', (req, res) => {
//   // ms.pipe(req, res, `public/${req.params.mp3}`)
//   res.send(`http://localhost:8080/${req.params.mp3}.mp3`);
// });


let server;

const options = {
  keepAlive: 30000,
  connectTimeoutMS: 30000,
  reconnectTries: 30,
  reconnectInterval: 5000
};

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, options, err => {
      if(err) {
        return reject(err);
      }

      server = app.listen(port, () => {
        console.log(`Scene-Partner app is listening on port ${ port }`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {

  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if(err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
