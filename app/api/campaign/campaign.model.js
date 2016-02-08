// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var campaignSchema = mongoose.Schema({

  name : {type : String, default: ''},
  url_name : {type : String, default: ''},

  client: {type: mongoose.Schema.ObjectId, ref: 'Client' },
  client_name: {type: String, default: '' },
  fee: {type: Number, default: 100},
  created: {
    type: Date,
    default: new Date()
  },
  live: {
    type: Boolean,
    default: false
  },
  start_time: {type: Number, default: 9},
  end_time: {type: Number, default: 17},
  start_date: Date,
  end_date: Date,
  days:{
    mon: {type: Boolean, default: true},
    tues: {type: Boolean, default: true},
    wed: {type: Boolean, default: true},
    thurs: {type: Boolean, default: true},
    fri: {type: Boolean, default: true},
    sat: {type: Boolean, default: false},
    sun: {type: Boolean, default: false},
  },

  // The agents that are actively on this campaign
  agents: [{
    agent: {type: mongoose.Schema.ObjectId, ref: 'Agent' },
    agent_name: String,
    active: {type: Boolean, default: true}
  }],

  // Relating to the admin script panel, not sure if plain text or url yet
  script: {type : String, default: ''},


  // These are the fields relating to the admin info panel
  objective: {type : String, default: ''},
  description: {type : String, default: ''},

  score_definition: {
    zero: {type : String, default: ''},
    one: {type : String, default: ''},
    two: {type : String, default: ''},
    three: {type : String, default: ''}
  },

  pricing: {type : String, default: ''},
  contact_info:{
    name: {type : String, default: ''},
    role: {type : String, default: ''},
    phone: {type : String, default: ''},
    email: {type : String, default: ''}
  },
  questions: {
    type : [{
      question: String,
      description: String
    }],
    default: []
  },
  faqs:{
    type : [{
      question: String,
      answer: String
    }],
    default: []
  }
});

// makes a url safe name
campaignSchema.methods.urlSafeName = function(name) {
    if(!name){name=''}
    return name.replace(/ /g,"-") + "-" + randomString(8);
};

function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
};

module.exports = mongoose.model('Campaign', campaignSchema);