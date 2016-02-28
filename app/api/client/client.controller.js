/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /clients              ->  index
 * POST    /clients              ->  create
 * GET     /clients/:id          ->  show
 * PUT     /clients/:id          ->  update
 * DELETE  /clients/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Client = require('./client.model');
var stripeSecretKey = require('../../config/stripe').secretKey;
var stripePublishableKey = require('../../config/stripe').publishableKey;
var stripe = require("stripe")(
  stripeSecretKey
);

var request = require('request')

// Get list of clients
exports.index = function(req, res) {
  Client.find(function (err, clients) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(clients);
  });
};

// Get a single client
exports.show = function(req, res) {
  if(req.params.id == 'me')
    req.params.id = req.user._id;
  Client.findById(req.params.id, req.query.fields, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.status(404).send('Not Found'); }
    if(req.query.stripe){
      return res.json({client:client,stripe:stripePublishableKey});
    }
    return res.json(client);
  });
};

// Creates a new client in the DB.
exports.create = function(req, res) {
  Client.findOne({'name':req.body.name},function(err,client){
    if(err) { return handleError(res, err); }
    if(client) { return handleError(res, err); }
    var client = new Client();
    client.name = req.body.name;
    client.password = client.generateHash(req.body.password);
    client.url_name = client.urlSafeName(req.body.name);
    client.save(function(err){
      if(err) { return handleError(res, err); }
      return res.json(client);
    })
  });
};

exports.charge = function(req,res){
  var stripeToken = req.body.stripeToken.id;
  var amount = req.body.amount;
  var description = req.body.description;
  var charge = stripe.charges.create({
    amount: amount,
    currency: "gbp",
    source: stripeToken,
    description: description}, function(err, charge) {
    if (err && err.type === 'StripeCardError'){
      console.log(err);
      return res.send({error:'Error in the charge'});
    }
    Client.findById(req.user._id,function(err,client){
      if (err) { return handleError(res, err); }
      if(!client) { return res.status(404).send('Not Found'); }
      client.funds = client.funds + amount;
      client.save(function(err){
        if (err) { return handleError(res, err); }
        // request.post({
        //   url:'/api/payments',
        //   form: charge
        // }, function(err,httpResponse,body){
        //   console.log(httpResponse,body);
        // });
        return res.json(charge);
      });
    })
  });
}

// Updates an existing client in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(req.params.id == 'me')
    req.params.id = req.user._id;
  Client.findById(req.params.id, function (err, client) {
    if (err) { return handleError(res, err); }
    if(!client) { return res.status(404).send('Not Found'); }
    var updated = _.merge(client, req.body);
    if(req.body.password)
      updated.password = agent.generateHash(req.body.password);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      if(last_check)
        return res.status(200).json({last_check: last_check});
      return res.status(200).json(updated);
    });
  });
};

// Deletes a client from the DB.
exports.destroy = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.status(404).send('Not Found'); }
    client.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}