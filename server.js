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
const { CLIENT_ORIGIN } = require('./config');

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

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = { app };
