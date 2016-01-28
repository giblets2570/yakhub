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

// Updates an existing client in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(req.params.id == 'me')
    req.params.id = req.user._id;
  Client.findById(req.params.id, function (err, client) {
    if (err) { return handleError(res, err); }
    if(!client) { return res.status(404).send('Not Found'); }
    var last_check;
    if(req.body.notifications){
      for (var i = client.notifications.length - 1; i >= 0; i--) {
        if(client.notifications[i].campaign.toString() == req.body.campaign.toString()){
          client.notifications[i].seen_all = true;
          last_check = new Date(client.notifications[i].last_check);
          client.notifications[i].last_check = new Date();
          break;
        }
      };
      delete req.body.notifications;
    }
    var updated = _.merge(client, req.body);
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