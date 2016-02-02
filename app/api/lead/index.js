'use strict';

var express = require('express');
var controller = require('./lead.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();


router.get('/count', controller.count);
router.post('/add', auth.hasRole('client'), controller.add);
router.post('/call_back', auth.hasRole('agent'), controller.call_back);
router.get('/next', auth.hasRole('agent'), controller.next);
router.get('/skip', auth.hasRole('agent'), controller.skip);
router.post('/custom', auth.hasRole('agent'), controller.custom);

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/', controller.remove);
router.delete('/:id', controller.destroy);

module.exports = router;