/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));
router.post('/fragments', require('./post'));
router.get('/fragments/:id/info', require('./get-info'));
router.get('/fragments/:id.:ext', require('./get-by-id'));
router.get('/fragments/:id', require('./get-by-id'));
router.put('/fragments/:id', require('./put'));
router.delete('/fragments/:id', require('./delete'));
// Other routes (PUT, DELETE, etc.) will go here later on...

module.exports = router;
