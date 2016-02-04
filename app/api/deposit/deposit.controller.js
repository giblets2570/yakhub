/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /leads              ->  index
 * POST    /leads              ->  create
 * GET     /leads/:id          ->  show
 */

'use strict';

var _ = require('lodash');
var Deposit = require('./deposit.model');

// Get list of leads
exports.index = function(req, res) {
  Deposit.find(function(err,deposits){
    if(err) { return handleError(res, err); }
    return res.json(deposits);
  })
};

// Get a single lead
exports.show = function(req, res) {
  Deposit.findById(req.params.id, function (err, deposit) {
    if(err) { return handleError(res, err); }
    if(!deposit) { return res.status(404).send('Not Found'); }
    return res.json(deposit);
  });
};

// Creates a new deposit in the DB.
exports.create = function(req, res) {
  var deposit = new Deposit();
  var updated = _.merge(deposit,req.body);
  updated.save(function(err){
    if(err) { return handleError(res, err); }
    return res.status(201).json(updated);
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}