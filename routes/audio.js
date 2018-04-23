'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const fs = require('fs-extra');

const { IBM_USERNAME, IBM_PASSWORD } = require('../config');

const text_to_speech = new TextToSpeechV1({
  username: IBM_USERNAME,
  password: IBM_PASSWORD
});

const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const localAuth = passport.authenticate('local', { session: false });
router.use(jsonParser);

// endpoint for getting audio files
router.get('/:text', localAuth, (req, res) => {
  const params = {
    text: req.body.text,
    voice: 'en-US_AllisonVoice',
    accept: 'audio/wav'
  };

  res.status(200).send(
    text_to_speech.synthesize(params).on('error', function(err) {
      console.log('Error:', err);
    }).pipe(fs.createWriteStream('text.wav'))
  );
});

module.exports = router;
