// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define our agent model
// module.exports allows us to pass this to other files when it is called

var agentSchema = mongoose.Schema({
  name: {type : String, default: ''},
  real_name: {type : String, default: ''},
  url_name: {type : String, default: ''},

  password: {type : String, default: ''},
  email: {type : String, default: ''},
  phone: {type : String, default: ''},
  type: {type : String, default: 'agent'},

  paid: {type : Number, default: 0},
  earned: {type : Number, default: 0},
  pay: {type: Number, default: 40},
  stripe:{
    access_token: String,
    livemode: Boolean,
    refresh_token: String,
    token_type: String,
    stripe_publishable_key: String,
    stripe_user_id: String,
    scope: String
  },
  // Information on the call the agent has just completed
  call_id: {type: mongoose.Schema.ObjectId, ref: 'Call'}

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