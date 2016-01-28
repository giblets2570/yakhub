'use strict';

var express = require('express');
var controller = require('./campaign.controller');

var router = express.Router();

router.put('/:id/request', controller.request);
router.get('/', controller.index);
router.get('/other', controller.other);
router.get('/apply', controller.apply);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.put('/', controller.session);

module.exports = router;