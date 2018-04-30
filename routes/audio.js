'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
// const { pipeline } = require('stream');
const fs = require('fs-extra');
// const ms = require('mediaserver');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const {
  IBM_USERNAME,
  IBM_PASSWORD,
  IBM_URL,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME
} = require('../config');

const text_to_speech = new TextToSpeechV1({
  username: IBM_USERNAME,
  password: IBM_PASSWORD,
  url: IBM_URL
});

const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const jwtAuth = passport.authenticate('jwt', { session: false });
router.use(jsonParser);

// endpoint for getting audio files
router.post('/', (req, res) => {
  console.log('Received request to audio POST endpoint');

  const filePath = `http://localhost:8080/${req.body.lineId}.mp3`;

  if(fs.existsSync(`/tmp/${req.body.lineId}.mp3`)) {
    return res.status(200).send(filePath);
  }

  const IBMparams = {
    text: req.body.text,
    voice: 'en-US_AllisonVoice',
    accept: 'audio/mp3'
  };

  const s3params = {
    Body: 'Hello world',
    Bucket: S3_BUCKET_NAME,
    Key: AWS_ACCESS_KEY_ID
  }

  // const audioFile = text_to_speech.synthesize(IBMparams)

  s3.putObject(params, function(err, data) {
    if(err) {
      console.log(err);
    }
    console.log(data);
  });

  //  THIS IS WORKING CODE, DON'T FORGET IT
  // text_to_speech.synthesize(IBMparams)
  //   .on('error', function(err) {
  //     console.log('Error synthesizing:', err);
  //   })
  //   .pipe(fs.createWriteStream(`/tmp/${req.body.lineId}.mp3`)
  //   .on('finish', function() {
  //     res.status(201).send(filePath);
  //   }));
});

router.get('/test', (req, res) => {
  res.send('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
});

module.exports = router;
