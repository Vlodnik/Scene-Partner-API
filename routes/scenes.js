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
