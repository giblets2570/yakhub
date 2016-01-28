'use strict';

var express = require('express');
var controller = require('./agent.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/twilio', auth.hasRole('agent'), controller.twilio);
router.get('/me', auth.hasRole('agent'), controller.me);
router.get('/other', auth.isAuthenticated(), controller.other);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.put('/:id/rate', auth.hasRole('client'), controller.rate);
router.put('/:id/active', auth.hasRole('client'), controller.active);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;