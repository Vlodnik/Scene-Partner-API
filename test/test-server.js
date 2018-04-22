'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiJwt = require('chai-jwt');
const faker = require('faker');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { User } = require('../models');
const { app, runServer, closeServer } = require('../server');
const config = require('../config');

const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiJwt);

describe('Scene-Partner API', function() {
  before(function() {
    return runServer(config.TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  // it('should 200 on GET requests', function() {
  //   return chai.request(app)
  //     .get('/api/fooooo')
  //     .then(function(res) {
  //       res.should.have.status(200);
  //       res.should.be.json;
  //     });
  //   });
  describe('POST endpoint for new users', function() {
    it('should create a new user and send a 201 status code', function() {
      const newUser = {
        username: faker.name.firstName() + faker.name.lastName(),
        password: faker.internet.password()
      }

      return chai.request(app)
        .post('/')
        .send(newUser)
        .then(function(res) {
          res.should.be.json;
          res.should.have.status(201)
          res.body.authToken.should.be.a.jwt;
        });

    });
  });

  describe('POST endpoint for creating jwts on login', function() {
    it('should return a jwt when given correct username and password', function() {
      const testUser = {
        username: faker.name.firstName() + faker.name.lastName(),
        password: faker.internet.password()
      };
      const encryptedPassword = bcrypt.hash(testUser.password, 10);

      return User.hashPassword(testUser.password)
        .then(function(hash) {
          return User.create({username: testUser.username, password: hash})
            .then(function(item){
              return chai.request(app)
                .post('/users/login')
                .send(testUser)
            })
            .then(function(res) {
              res.should.be.json;
              res.should.have.status(200);
              res.body.authToken.should.be.a.jwt;
            });
        });
    });
  });

});
