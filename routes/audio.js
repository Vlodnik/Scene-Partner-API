'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
// const { pipeline } = require('stream');
const fs = require('fs-extra');
const ms = require('mediaserver');

const { IBM_USERNAME, IBM_PASSWORD, IBM_URL } = require('../config');

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
  console.log(req.body);

    const params = {
      text: req.body.text,
      voice: 'en-US_AllisonVoice',
      accept: 'audio/mp3'
    };

    const filePath = `http://localhost:8080/${req.body.lineId}.mp3`;

    text_to_speech.synthesize(params)
      .on('error', function(err) {
        console.log('Error synthesizing:', err);
      })
      .pipe(fs.createWriteStream(`public/${req.body.lineId}.mp3`)
      .on('finish', function() {
        res.status(201).send(filePath);
      }));

  // console.log(pipeline);
  // text_to_speech.synthesize(params, () => {
  //   res.pipe(fs.createWriteStream(`public/${req.body.lineId}.mp3`),
  //     (err) => filePath)
  //   }
  // )
  // .on('error', function(err) {
  //   console.log('Error synthesizing:', err);
  // })
  // process.stdin.pipe();

    // console.log(proces.stdin.pipe());

  // .pipeline(fs.createWriteStream(`public/${req.body.lineId}.mp3`),
  //   (err) => res.status(201).send(filePath));

  // async function createFile() {
  //
  // }

  // res.status(201).send(filePath);

  // 'http://localhost:8080/By8zPHChz.mp3'

  // const createAudioFile = new Promise((resolve, reject) => {
  //     resolve(text_to_speech.synthesize(params).on('error', function(err) {
  //       console.log('Error:', err);
  //     }).pipe(fs.createWriteStream(filePath)))
  //
  //     reject('Failed to create audio file');
  // });
  //
  // function sendFilePath() {
  //   createAudioFile
  //     .then(filePath => {
  //       console.log('from audio router, the filePath is', filePath);
  //       res.status(201).send(filePath)
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
  // }
  //
  // sendFilePath();



  // ms.pipe(req, res, filePath);

  // res.send(`http://localhost:8080/${req.body.lineId}.mp3`);
  // res.send('http://localhost:8080/HyJL7EA3M.mp3');


  // fs.readFile(filePath, function(err, data) {
  //   console.log(data);
  //   res.send(data);
  // });
});

router.get('/test', (req, res) => {
  res.send('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
});

module.exports = router;
