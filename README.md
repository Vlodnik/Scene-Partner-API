# <a href="https://goofy-goldstine-cd55e2.netlify.com/" target="_blank">Scene Partner</a>

##Introduction
Scene Partner is a line reading app that lets you run lines using your device. This repo
houses the app's API, which has CRUD endpoints for the scenes users create. It also has
user authentication endpoints that make use of Passport and JSON web tokens.

The other purpose of the API is to communicate with IBM's text to speech API, which is
what enables the app to convert text entered by the user into audio files.

##Technologies
This API is part of a full-stack express application using Node.js and a MongoDB database.
The app uses the Mongoose library to create models for user data, and to communicate
with the database. The API is RESTful and CORS enabled. User authentication is handled
with the Passport.js framework, and passwords are encrypted with bcrypt before being
stored as secure hashes on a MongoDB database hosted on mLab. The frontend is written
using React-Redux.
