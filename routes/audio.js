'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const fs = require('fs-extra');
const AWS = require('aws-sdk');
const stream = require('stream');
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

  const getParams = {
    Bucket: S3_BUCKET_NAME,
    Key: `${req.body.lineId}.mp3`
  };

  s3.getObject(getParams, function(err, data) {
    if(data) {
      return res.status(200).send(`https://scene-partner-mp3s.s3.amazonaws.com/${req.body.lineId}.mp3`);
    }

    const IBMparams = {
      text: req.body.text,
      voice: 'en-US_AllisonVoice',
      accept: 'audio/mp3'
    };

    text_to_speech.synthesize(IBMparams)
      .on('error', function(err) {
        console.log('Error synthesizing:', err);
      })
      .pipe(uploadFromStream(s3))
      .on('finish', function(data) {
        // res.status(201).send(filePath);
      });

    function uploadFromStream(s3) {
      const pass = new stream.PassThrough();

      const params = {Bucket: S3_BUCKET_NAME, Key: `${req.body.lineId}.mp3`, ACL: 'public-read', Body: pass};
      s3.upload(params, function(err, data) {
        // console.log(err, data);
        res.status(201).send(data.Location)
      });

      return pass;
    }
  });

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
