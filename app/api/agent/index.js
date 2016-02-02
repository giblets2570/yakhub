'use strict';

var express = require('express');
var controller = require('./agent.controller');

var router = express.Router();

router.get('/twilio', controller.twilio);
router.get('/me', controller.me);
router.get('/other', controller.other);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.put('/:id/rate', controller.rate);
router.put('/:id/active', controller.active);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;