'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { User } = require('../models');

function createAuthToken(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', { session: false });
router.use(jsonParser);

// endpoint for user to sign in
router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.serialize());
  return res.json({ authToken });
});

// endpoint for user to create account





module.exports = router;
