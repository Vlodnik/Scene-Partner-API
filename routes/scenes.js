'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { Scene } = require('../models');

const jwtAuth = passport.authenticate('jwt', { session: false });
router.use(jwtAuth);

// GET endpoint for a user's scenes
router.get('/', (req, res) => {
  Scene
    .find({user: req.user.username})
    .then(scenes => {
      res.status(200).json(scenes);
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error: GET' });
    });
});

module.exports = router;
