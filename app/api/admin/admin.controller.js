/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /admins              ->  index
 * POST    /admins              ->  create
 * GET     /admins/:id          ->  show
 * PUT     /admins/:id          ->  update
 * DELETE  /admins/:id          ->  destroy
 */

/**
 * Extra routes to handle some logic
 */

'use strict';

var _ = require('lodash');
var Admin = require('./admin.model');
var Campaign = require('../campaign/campaign.model');
var Call = require('../call/call.model');

// Get list of admins
exports.index = function(req, res) {
  Admin.find({},req.query.fields,function (err, admins) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(admins);
  });
};

// Get a single admin
exports.show = function(req, res) {
  if(req.params.id == 'name'){
    Admin.findOne({name: req.query.admin_name}, req.query.fields, function (err, admin) {
      if(err) { return handleError(res, err); }
      if(!admin) { return res.status(404).send('Not Found'); }
      return res.json(admin);
    });
  }else{
    Admin.findById(req.params.id, req.query.fields, function (err, admin) {
      if(err) { return handleError(res, err); }
      if(!admin) { return res.status(404).send('Not Found'); }
      return res.json(admin);
    });
  }
};

// Creates a new admin in the DB.
exports.create = function(req, res) {
  Admin.findOne({'name':req.body.name},function(err,oldAdmin){
    if(err) { return handleError(res, err); }
    if(oldAdmin) { return res.status(403).json({'message':'Admin with that name already exists'}); }
    var admin = new Admin();
    admin.name = req.body.name;
    admin.password = admin.generateHash(req.body.password);
    admin.email = req.body.email;
    admin.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.status(201).json(admin);
    });
  });
};

// Updates an existing admin in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Admin.findById(req.params.id, function (err, admin) {
    if (err) { return handleError(res, err); }
    if(!admin) { return res.status(404).send('Not Found'); }
    var updated = _.merge(admin, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(updated);
    });
  });
};

// Deletes a admin from the DB.
exports.destroy = function(req, res) {
  Admin.findById(req.params.id, function (err, admin) {
    if(err) { return handleError(res, err); }
    if(!admin) { return res.status(404).send('Not Found'); }
    Admin.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

/**
 * App logic routes outside CRUD
 */



/**
 * Error handling route
 */

function handleError(res, err) {
  return res.status(500).send(err);
}