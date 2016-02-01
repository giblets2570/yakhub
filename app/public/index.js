'use strict';

var express = require('express');

var router = express.Router();
var config = require('../config/environment');
var auth = require('../auth/auth.service');
var url = require('url');

router.get('/admin/partials/:name', function (req, res) {
  var name = req.params.name;
  console.log(name);
  return res.render('admin/partials/' + name);
});

router.get('/client/partials/:name', function (req, res) {
  var name = req.params.name;
  console.log(name);
  return res.render('client/partials/' + name);
});

router.get('/agent/partials/:name', function (req, res) {
  var name = req.params.name;
  console.log(name);
  return res.render('agent/partials/' + name);
});



module.exports = router;