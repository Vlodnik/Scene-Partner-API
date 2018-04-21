'use strict';

require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
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
const { localStrategy, jwtStrategy } = require('./strategies');

app.use(cors(corsOptions));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;

app.get('/api/*', (req, res) => {
  res.json({ ok: true });
});

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
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

module.exports = { app, runServer, closeServer };
