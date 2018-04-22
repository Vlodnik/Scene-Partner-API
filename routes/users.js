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
router.post('/', (req, res) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if(missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(field =>
    req.body[field].length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(field =>
    'max' in sizedFields[field] &&
    req.body[field].length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `${ tooSmallField } must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Password can be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  const { username, password } = req.body;

  return User
    .find({ username })
    .count()
    .then(count => {
      if(count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password)
    })
    .then(hash => {
      return User.create({
        username,
        password: hash
      });
    })
    .then(user => {
      const authToken = createAuthToken(user);
      return res.status(201).json({ authToken });
    })
    .catch(err => {
      if(err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

module.exports = router;
