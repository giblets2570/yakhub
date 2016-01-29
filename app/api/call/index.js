'use strict';

var express = require('express');
var controller = require('./call.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/make', controller.makeCall);
router.put('/data', controller.addCallData);
router.post('/recording/:call_id', controller.twilioCallback);
router.get('/previous', controller.previous);

router.get('/', auth.hasRole('client'), controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;