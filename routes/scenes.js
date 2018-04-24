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
    editing: req.body.editing,
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

const sceneFields = [
  'title',
  'editing',
  'userCharacter',
  'lines'
];

router.put('/:id', jsonParser, (req, res) => {
  if(req.body.id !== req.params.id) {
    const message = `Request body ID ${ req.body.id} does not match request path ID ${ req.params.id }`;
    console.error(message);
    return res.status(400).send(message);
  }

  console.log(`Updating scene object ${ req.params.id }`);
  const newScene = {};
  sceneFields.forEach(field => {
    if(field in req.body) {
      newScene[field] = req.body[field]
    }
  });

  Scene
    .findById(req.params.id)
    .then(scene => {
      if(scene.user === req.user.username) {
        Scene
          .findByIdAndUpdate(req.params.id, { $set: newScene })
          .then(() => {
            res.status(200).json({ message: 'Saved!' });
          })
      } else {
        const message = 'Unauthorized';
        console.error(message);
        return res.status(401).send(message);
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error: PUT' });
    });
});

module.exports = router;
