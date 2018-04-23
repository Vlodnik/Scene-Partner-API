'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const sceneSchema = mongoose.Schema({
  user: { type: String, required: true },
  editing: Boolean,
  title: String,
  userCharacter: String,
  lines: [
    {
      character: String,
      text: String
    }
  ]
});

sceneSchema.methods.serialize = function() {
  return {
    user: this.user,
    editing: this.editing,
    title: this.title,
    userCharacter: this.userCharacter,
    lines: this.lines
  };
}

const Scene = mongoose.model('Scene', sceneSchema);

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.methods.serialize = function() {
  return {
    username: this.username
  };
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10)
};

const User = mongoose.model('User', userSchema);

module.exports = { Scene, User };
