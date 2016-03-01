'use strict';

var express = require('express');
var controller = require('./lead.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();


router.get('/count', controller.count);
router.post('/add', controller.add);
router.post('/call_back', controller.call_back);
router.get('/next', controller.next);
router.get('/skip', controller.skip);
router.post('/custom', controller.custom);
router.post('/remove', controller.remove);

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;