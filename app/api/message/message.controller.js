/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /leads              ->  index
 * POST    /leads              ->  create
 * GET     /leads/:id          ->  show
 * PUT     /leads/:id          ->  update
 * DELETE  /leads/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Message = require('./message.model');
var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '174135',
  key: '9d60e889329cae081239',
  secret: 'abd5f1f869348077e47f',
  encrypted: true
});
pusher.port = 443;

// Get aws details
var awsDetails = require('../../config/aws');
var crypto = require('crypto');

// Get list of leads
exports.index = function(req, res) {
  // if(req.user.type == 'agent'){
  //   Message.find({agents: {$elemMatch: {agent: req.user._id}}},req.query.fields,function (err, messages) {
  //     if(err) { return handleError(res, err); }
  //     return res.status(200).json(messages);
  //   })
  // }
  // else if(req.user.type == 'client'){
  //   Message.find({clients: {$elemMatch: {client: req.user._id}}},req.query.fields,function (err, messages) {
  //     if(err) { return handleError(res, err); }
  //     return res.status(200).json(messages);
  //   })
  // }
  if(req.query.campaign_id){
    Message.findOne({campaign: req.query.campaign_id},function(err,messages){
      if(err) { return handleError(res, err); }
      if(!messages) { return res.json({messages: []}); }
      return res.json(messages);
    })
  }else{
    return res.json([]);
  }
};

// Get a single lead
exports.show = function(req, res) {
  Message.findById(req.params.id, function (err, message) {
    if(err) { return handleError(res, err); }
    if(!message) { return res.status(404).send('Not Found'); }
    return res.json(message);
  });
};

// Creates a new message in the DB.
exports.create = function(req, res) {
  var message = new Message();
  var updated = _.merge(message,req.body);
  updated.client = req.user._id;
  updated.client_name = req.user.name;
  updated.save(function(err){
    if(err) { return handleError(res, err); }
    pusher.trigger('updates_channel', updated.campaign, {
      "message": req.body.messages[0]
    });
    return res.status(201).json(updated);
  });
};

// Updates an existing message in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Message.findById(req.params.id, function (err, message) {
    if (err) { return handleError(res, err); }
    if(!message) { return res.status(404).send('Not Found'); }
    if(req.body.messages){
      message.messages = req.body.messages;
      message.last_message = new Date();
    }
    message.save(function (err) {
      if (err) { return handleError(res, err); }
      pusher.trigger('updates_channel', message.campaign, {
        "message": req.body.messages[req.body.messages.length-1]
      });
      return res.status(200).json(message);
    });
  });
};

// Deletes a message from the DB.
exports.destroy = function(req, res) {
  Message.findById(req.params.id, function (err, message) {
    if(err) { return handleError(res, err); }
    if(!message) { return res.status(404).send('Not Found'); }
    message.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

exports.upload = function(req, res){
  var bucket_name = 'yakhub-chats';
  var myS3Account = new s3instance(awsDetails.aws_access_key_id, awsDetails.aws_secret_key);
  var policy = myS3Account.writePolicy('uploads/', bucket_name, 60, 10);
  return res.json(policy);
}

function s3instance(accessKey, secretKey) {

  this.accessKey = accessKey;
  this.secretKey = secretKey;

  this.writePolicy = function(key, bucket, duration, filesize) {
    var dateObj = new Date;
    var dateExp = new Date(dateObj.getTime() + duration * 1000);
    var policy = {
      "expiration":dateExp.getUTCFullYear() + "-" + dateExp.getUTCMonth() + 1 + "-" + dateExp.getUTCDate() + "T" + dateExp.getUTCHours() + ":" + dateExp.getUTCMinutes() + ":" + dateExp.getUTCSeconds() + "Z",
      "conditions":[
        { "bucket":bucket },
        ["starts-with", "$key", ""],
        { "acl":"public-read" },
        ["starts-with", "$Content-Type", ""],
        ["content-length-range", 0, 10 * 1024 * 1024]
      ]
    };
    var policyString = JSON.stringify(policy);
    var policyBase64 = new Buffer(policyString).toString('base64');
    var signature = crypto.createHmac("sha1", this.secretKey).update(policyBase64);
    var accessKey = this.accessKey;
    var s3Credentials = {
      policy:policyBase64,
      signature:signature.digest("base64"),
      key:accessKey
    };
    return s3Credentials;
  };
}

function handleError(res, err) {
  return res.status(500).send(err);
}