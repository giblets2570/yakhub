// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define our agent model
// module.exports allows us to pass this to other files when it is called

var agentSchema = mongoose.Schema({
  name: {type : String, default: ''},
  url_name: {type : String, default: ''},

  password: {type : String, default: ''},
  email: {type : String, default: ''},
  phone: {type : String, default: ''},
  type: {type : String, default: 'agent'},

  location: {type : String, default: ''},
  price: {type : Number, default: 15},

  // Information on the call the agent has just completed
  call_id: {type: mongoose.Schema.ObjectId, ref: 'Call'},

  campaigns: [{
    campaign: {
      type: mongoose.Schema.ObjectId,
      ref: 'Campaign'
    },
    campaign_name: String,
    description: String,
    date_started: Date,
    date_ended: Date,
    client: {
      type: mongoose.Schema.ObjectId,
      ref: 'Client'
    },
    client_name: String,
    review: {
      rating: {type: Number, default: 0},
      text: {type: String, default: ''},
      date: Date
    }
  }],

  availabilities: {
    type: [Number],
    default: [0, 0, 0, 0, 0, 0, 0]
  },

  skills: {
    type: [String],
    default: []
  },

  available: {type: Boolean, default: true},

  notifications: {
    last_check: {type: Date, default: new Date()},
    seen_all: {type: Boolean, default: false}
  },

  new_messages: {type: Boolean, default: false},

  about_me: {type : String, default: ''},

  number_reviews: {type : Number, default: 0},
  rating: {type : Number, default: 0},
  created: {
    type: Date,
    default: new Date()
  }
});

// methods ======================
// generating a hash
agentSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
agentSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// makes a url safe name
agentSchema.methods.urlSafeName = function(name) {
    return name.replace(/ /g,"-") + "-" + randomString(8);
};

function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];

  return result;
};

module.exports = mongoose.model('Agent', agentSchema);