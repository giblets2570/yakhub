/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /leads              ->  index
 * POST    /leads              ->  create
 * GET     /leads/:id          ->  show
 */

'use strict';

var _ = require('lodash');
var Payment = require('./payment.model');

var stripeSecretKey = require('../../config/stripe').secretKey;
var stripePublishableKey = require('../../config/stripe').publishableKey;
var stripe = require("stripe")(
  stripeSecretKey
);

// Get list of leads
exports.index = function(req, res) {
  Payment.find(function(err,payments){
    if(err) { return handleError(res, err); }
    return res.json(payments);
  })
};

// Get a single lead
exports.show = function(req, res) {
  Payment.findById(req.params.id, function (err, payment) {
    if(err) { return handleError(res, err); }
    if(!payment) { return res.status(404).send('Not Found'); }
    return res.json(payment);
  });
};

// Creates a new payment in the DB.
exports.create = function(req, res) {
  var payment = new Payment();
  var updated = _.merge(payment,req.body);
  updated.save(function(err){
    if(err) { return handleError(res, err); }
    return res.status(201).json(updated);
  });
};

// Get a stripe
exports.stripe = function(req, res) {
  return res.json({stripe:stripePublishableKey});
};

function handleError(res, err) {
  return res.status(500).send(err);
}