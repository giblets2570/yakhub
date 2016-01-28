// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var campaignSchema = mongoose.Schema({

  name : {type : String, default: ''},
  url_name : {type : String, default: ''},

  client: {type: mongoose.Schema.ObjectId, ref: 'Client' },
  client_name: {type: String, default: '' },

  created: {
    type: Date,
    default: new Date()
  },
  live: {
    type: Boolean,
    default: false
  },
  start_date: Date,
  end_date: Date,
  // These are the applications for joining a campaign
  applications: [{
    agent: {type: mongoose.Schema.ObjectId, ref: 'Agent' },
    agent_name: {type: String, default: '' },
    created: Date,
    seen: {type: Boolean, default: false}
  }],

  // The slots that are available for a given campaign
  available_slots: [{
    time: Date,
    num_agents: Number
  }],
  allocated_slots: [{
    agent: {type: mongoose.Schema.ObjectId, ref: 'Agent' },
    agent_name: {type: String, default: '' },
    time: Date,
    created: Date
  }],
  requested_slots: [{
    agent: {type: mongoose.Schema.ObjectId, ref: 'Agent' },
    agent_name: {type: String, default: '' },
    time: Date,
    status: {type: String, default: '' },
    created: Date
  }],

  // Extra files and materials that the client may think is useful for this campaign
  extra_materials:[{
    filename: {type: String, default: ''},
    file_url: {type: String, default: ''}
  }],


  from_email: {
    email: {type : String, default: ''},
    password: {type : String, default: ''}
  },

  follow_up_email: {type: String, default: ''},


  // The agents that are actively on this campaign
  agents: [{
    agent: {type: mongoose.Schema.ObjectId, ref: 'Agent' },
    agent_name: String,
    cost_per_hour: Number,
    active: {type: Boolean, default: true}
  }],

  // Relating to the admin script panel, not sure if plain text or url yet
  script: {type : String, default: ''},


  // These are the fields relating to the admin info panel
  background: {type : String, default: ''},
  website: {type : String, default: ''},
  demographic: {type : String, default: ''},
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