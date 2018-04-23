'use strict';
exports.CLIENT_ORIGIN = 'placeholder';
exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/scenePartnerDb';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || global.TEST_DATABASE_URL || 'mongodb://localhost/test-scenePartnerDb';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.IBM_USERNAME = process.env.IBM_USERNAME;
exports.IBM_PASSWORD = process.env.IBM_PASSWORD;
