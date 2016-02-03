/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /agents              ->  index
 * POST    /agents              ->  create
 * GET     /agents/:id          ->  show
 * PUT     /agents/:id          ->  update
 * DELETE  /agents/:id          ->  destroy
 */

/**
 * Extra routes to handle some logic
 * GET /agents/:id/twilio       ->  twilio
 */

'use strict';

var _ = require('lodash');
var Agent = require('./agent.model');
var Campaign = require('../campaign/campaign.model');
var Call = require('../call/call.model');
var days = ['sun','mon','tues','wed','thurs','fri','sat'];

var auth = require('../../auth/auth.service');

var stripe = require("stripe")(
  "sk_test_3ckK6VP7I08hjgym5B2uOxkF"
);

// Create a twilio client
var twilioDetails = require('../../config/twilio');
var twilio = require('twilio');
var capability = new twilio.Capability(twilioDetails.accountID, twilioDetails.authToken);
capability.allowClientOutgoing(twilioDetails.appID);

// Get list of agents
exports.index = function(req, res) {
  if(req.query.campaign){
    Agent.find({'campaigns.campaign': req.session.campaign_id},req.query.fields,function (err, agents) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(agents);
    });
  }else{
    Agent.find({},req.query.fields,function (err, agents) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(agents);
    });
  }
};

// Get a single agent
exports.show = function(req, res) {
  if(req.params.id == 'name'){
    Agent.findOne({name: req.query.agent_name}, req.query.fields, function (err, agent) {
      if(err) { return handleError(res, err); }
      if(!agent) { return res.status(404).send('Not Found'); }
      return res.json(agent);
    });
  }else if(req.query.stats){
    Call.find({campaign: req.query.campaign_id, agent: req.params.id},function(err,calls){
      if(err) { return handleError(res, err); }
      if(!calls) { return res.status(404).send('Not Found'); }
      var total_duration = 0;
      var total_dials = calls.length;
      var last_dial = new Date(0);
      for (var i = calls.length - 1; i >= 0; i--) {
        total_duration+=calls[i].duration;
        if(calls[i].created.valueOf()>last_dial.valueOf()) last_dial = calls[i].created;
      };
      return res.json({total_duration: total_duration,total_dials:total_dials,last_dial:last_dial})
    })
  }else{
    Agent.findById(req.params.id, req.query.fields, function (err, agent) {
      if(err) { return handleError(res, err); }
      if(!agent) { return res.status(404).send('Not Found'); }
      return res.json(agent);
    });
  }
};

// Creates a new agent in the DB.
exports.create = function(req, res) {
  Agent.findOne({'name':req.body.name},function(err,oldAgent){
    if(err) { return handleError(res, err); }
    if(oldAgent) { return res.status(403).json({'message':'Agent with that name already exists'}); }
    var agent = new Agent();
    agent.name = req.body.name;
    agent.password = agent.generateHash(req.body.password);
    agent.email = req.body.email;
    agent.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.status(201).json(agent);
    });
  });
};

// Updates an existing agent in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Agent.findById(req.params.id, function (err, agent) {
    if (err) { return handleError(res, err); }
    if(!agent) { return res.status(404).send('Not Found'); }
    var paid = agent.paid;
    var updated = _.merge(agent, req.body);
    if(req.body.campaigns)
      updated.campaigns = req.body.campaigns;
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      if(paid < updated.paid){
        stripe.transfers.create({
          amount: Math.floor(updated.paid - paid),
          currency: "gbp",
          destination: agent.stripe.stripe_user_id,
          description: "Payment for " + agent.name
        }, function(err, transfer) {
          // asynchronously called
          if(err){return res.json({error:'Error in the request'})}
          return res.status(200).json(transfer);
        });
      }else{
        return res.status(200).json(updated);
      }
    });
  });
};

// Deletes a agent from the DB.
exports.destroy = function(req, res) {
  Agent.findById(req.params.id, function (err, agent) {
    if(err) { return handleError(res, err); }
    if(!agent) { return res.status(404).send('Not Found'); }
    Agent.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

/**
 * App logic routes outside CRUD
 */

// Get's a twilio token for an agent, and also returns the agents id
exports.twilio = function(req, res){
  var fifteenMinutes = 900000;
  var now = (new Date()).getHours();
  var day = (new Date()).getDay();
  Agent.findById(req.user._id, function(err, agent){
    if(err) { return handleError(res, err); }
    if(!agent) { return res.status(404).json({'message': 'No agent'}); }
    Campaign.findById(req.query.campaign,function(err,campaign){
      if(err) { return handleError(res, err); }
      if(!campaign) { return res.status(404).json({'message': 'No campaign'}); }
      console.log(now,campaign.start_time,campaign.end_time);
      if(campaign.days[days[day]]&&campaign.start_time<=now&&campaign.end_time>now){
        var token = capability.generate();
        return res.status(201).json({token: token, agent_id: req.user._id});
      }else{
        return res.status(406).json({message: 'You are not authorized to make phone calls at this time!', agent_id: req.user._id});
      }
    })
  });
}

// Get's a twilio token for an agent, and also returns the agents id
exports.me = function(req, res){
  if(req.query.calls){
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var today = new Date(now.valueOf() - hours*60*60*1000 - minutes*60*1000);
    Call.find({agent: req.user._id, created: {$gte: today}},function(err,calls){
      if(err) { return res.status(200).json(req.user); }
      calls.sort(function(a, b){
        return b.created.valueOf() - a.created.valueOf();
      });
      var total_duration = 0;
      var last_earning = 0;
      for (var i = calls.length - 1; i >= 0; i--) {
        total_duration += calls[i].duration;
        last_earning = calls[i].duration*2/3;
      };
      var earned = total_duration*(2/3);
      return res.status(200).json({agent: req.user,earned: earned,last_earning: last_earning});
    })
  }else{
    return res.status(200).json(req.user);
  }
}

// Get's a twilio token for an agent, and also returns the agents id
exports.other = function(req, res){
  Agent.findOne({url_name: req.query.url_name}, function(err, agent){
    if(err) { return handleError(res, err); }
    if(!agent) res.status(400).send("Agent not found!");
    return res.status(200).json(agent);
  })
}

// This updates whether an agent is active on a campaign
exports.active = function(req, res){
  Agent.findById(req.params.id, function(err, agent){
    if(err) { return handleError(res, err); }
    if(!agent) { return res.status(403).json({'message': 'No agent'}); }
    var k = -1
    for (var i = agent.campaigns.length - 1; i >= 0; i--) {
      if(agent.campaigns[i].campaign.toString() == req.session.campaign_id.toString()){
        k = i;
        break;
      }
    };
    if(k>-1){
      agent.campaigns[k].date_ended = req.body.date_ended;
    }else{
      if(req.body.active){
        agent.campaigns.push({
          campaign: req.session.campaign_id,
          campaign_name: req.session.campaign_name,
          date_started: new Date()
        })
      }
    }
    agent.save(function(err){
      if(err) { return handleError(res, err); }
      Campaign.findById(req.session.campaign_id, function(err,campaign){
        if(err) { return handleError(res, err); }
        var k = -1;
        for (var i = campaign.agents.length - 1; i >= 0; i--) {
          if(campaign.agents[i].agent.toString() == agent._id.toString()){
            k = i;
            break;
          }
        };
        if(k>-1){
          campaign.agents[i].active = req.body.active;
        }else{
          campaign.agents.push({
            active: req.body.active,
            agent: agent._id,
            agent_name: agent.name
          })
        }
        var now = (new Date()).valueOf();
        if(!req.body.active){
          for (var i = campaign.allocated_slots.length - 1; i >= 0; i--) {
            if(campaign.allocated_slots[i].agent.toString() == agent._id.toString()){
              if(campaign.allocated_slots[i].time.valueOf() > now)
                campaign.allocated_slots.splice(i,1);
            }
          };
        }
        campaign.save(function(err){
          if(err) { return handleError(res, err); }
          return res.status(200).json({'message':'Update complete'})
        })
      })
    })
  })
}

// Rates an agent from the client side
exports.rate = function(req, res) {
  Agent.findById(req.params.id,function(err,agent){
    if(err) { return handleError(res, err); }
    if(!agent) return res.status(401).json({'message':'Agent not found!'})
    var total = 0;
    var number_reviews = 0;
    for (var i = agent.campaigns.length - 1; i >= 0; i--) {
      if(agent.campaigns[i].campaign.toString() == req.session.campaign_id.toString()){
        if(req.body.rating)
          agent.campaigns[i].review.rating = req.body.rating;
        if(req.body.text)
          agent.campaigns[i].review.text = req.body.text;
        if(!agent.campaigns[i].review.date)
          agent.campaigns[i].review.date = new Date();
      }
      if(agent.campaigns[i].review.date)
        number_reviews += 1;
      total += agent.campaigns[i].review.rating;
    };
    agent.number_reviews = number_reviews;
    agent.rating = total / number_reviews;
    agent.save(function(err) {
      if (err) { return handleError(res, err); }
      return res.status(201).json(agent);
    });
  });
};


/**
 * Error handling route
 */

function handleError(res, err) {
  return res.status(500).send(err);
}