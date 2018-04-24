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

router.get('/:id', (req, res) => {
  Scene
    .findById(req.params.id)
    .then(scene => {
      if(scene.user === req.user.username) {
        res.status(200).json(scene.serialize());
      } else {
        const message = 'Unauthorized';
        console.error(message);
        return res.status(401).send(message);
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error: GET id' });
    })
});

router.post('/', jsonParser, (req, res) => {
  if(!(req.user.username && req.body.title)) {
    const message = 'Request must come from a user and have a title';
    console.error(message);
    return res.status(400).send(message);
  }

  console.log('Creating new scene object');
  const newScene = {
    user: req.user.username,
    title: req.body.title,
    editing: req.body.editing || true,
    userCharacter: req.body.userCharacter || 'all',
    lines: req.body.lines || []
  };

  Scene
    .create(newScene)
    .then(scene => {
      res.status(201).json(scene)
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error: POST' });
    });
});

module.exports = router;
