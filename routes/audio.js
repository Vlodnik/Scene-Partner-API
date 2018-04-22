'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const localAuth = passport.authenticate('local', { session: false });
router.use(jsonParser);

// endpoint for getting audio files
router.get('/:text', localAuth, (req, res) => {

});

module.exports = router;
