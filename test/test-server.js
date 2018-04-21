'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiJwt = require('chai-jwt');
const faker = require('faker');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { User } = require('../models'):
const { app } = require('../server');
const config = require('../config');

const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiJwt);

describe('Scene-Partner API', function() {
  

  it('should 200 on GET requests', function() {
    return chai.request(app)
      .get('/api/fooooo')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
    });
});
