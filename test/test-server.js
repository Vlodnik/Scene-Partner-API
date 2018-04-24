'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiJwt = require('chai-jwt');
const faker = require('faker');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { User, Scene } = require('../models');
const { app, runServer, closeServer } = require('../server');
const config = require('../config');

const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiJwt);

function seedUserData() {
  console.info('Seeding user data');
  const seedData = [];

  for(let i = 1; i <= 5; i++) {
    seedData.push(generateUserData());
  }

  return User.insertMany(seedData);
}

function generateUserData() {
  return {
    username: faker.name.firstName() + faker.name.lastName(),
    password: faker.internet.password()
  };
}

function seedSceneData() {
  console.info('Seeding scene data');
  const seedData = [];

  return User
    .find()
    .then(function(users) {
      users.forEach(function(user) {
        for(let i = 1; i <= 5; i++) {
          const newScene = generateSceneData(user.username);
          seedData.push(newScene);
        }
      });
    })
    .then(function() {
      return Scene.insertMany(seedData)
    });
}

function generateSceneData(username) {
  return {
    user: username,
    editing: faker.random.boolean(),
    title: faker.random.words(),
    userCharacter: 'all',
    lines: [
      {
        character: faker.name.firstName(),
        text: faker.lorem.sentence()
      }
    ]
  };
}

function tearDownDb() {
  console.warn('Tearing down database');
  mongoose.connection.dropDatabase();
}

function createAuthToken(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

describe('Scene-Partner API', function() {
  before(function() {
    return runServer(config.TEST_DATABASE_URL);
  });

  beforeEach(function(done) {
    seedUserData()
      .then(function() {
        return seedSceneData();
      })
      .then(function() {
        return done();
      });
  });

  afterEach(function() {
    return tearDownDb();
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
        .post('/users')
        .send(newUser)
        .then(function(res) {
          res.should.be.json;
          res.should.have.status(201)
          res.body.authToken.should.be.a.jwt;
        })
        .then(function() {
          return User
            .findOne({username: newUser.username})
            .then(function(user) {
              user.username.should.equal(newUser.username);
            });
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

  describe('GET endpoint', function() {

    it('should respond with json scenes matching username', function() {
      let testUser;
      let testJwt;

      return User
        .findOne()
        .then(function(user) {
          testUser = user.username;
          testJwt = createAuthToken(user.serialize());
        })
        .then(function() {
          return chai.request(app)
            .get('/scenes')
            .set('Authorization', `Bearer ${ testJwt }`)
        })
        .then(function(res) {
          res.should.be.json;
          res.should.have.status(200);
          for(let scene in res.body) {
            res.body[scene].user.should.equal(testUser);
          }
        });
    });

    it('should respond with a scene object based on ID', function() {
      let sceneId;
      let testUser;
      let testJwt;

      return User
        .findOne()
        .then(function(user) {
          testUser = user.username;
          testJwt = createAuthToken(user.serialize());
        })
        .then(function() {
          return Scene.findOne({user: testUser})
        })
        .then(function(scene) {
          sceneId = scene._id;

          return chai.request(app)
          .get(`/scenes/${sceneId}`)
          .set('Authorization', `Bearer ${ testJwt }`)
        })
        .then(function(res) {
          console.log(res.body);
          res.should.be.json;
          res.should.have.status(200);
          res.body.user.should.equal(testUser);
        });
    });
  });

  describe('POST endpoint', function() {
    it('should create a new scene object and return 201', function() {
      let newScene;
      let testJwt;

      return User
        .findOne()
        .then(function(user) {
          newScene = generateSceneData(user.username);
          testJwt = createAuthToken(user.serialize());

          return chai.request(app)
            .post('/scenes')
            .set('Authorization', `Bearer ${ testJwt }`)
            .send(newScene)
        })
        .then(function(res) {
          res.should.be.json;
          res.should.have.status(201);
          res.body.user.should.equal(newScene.user);
          res.body.editing.should.equal(newScene.editing);
          res.body.title.should.equal(newScene.title);
          res.body.userCharacter.should.equal(newScene.userCharacter);
        });
    });
  });

});
