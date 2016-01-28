'use strict';

var express = require('express');
var controller = require('./admin.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.put('/:id/rate', auth.hasRole('client'), controller.rate);
router.put('/:id/active', auth.hasRole('client'), controller.active);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;