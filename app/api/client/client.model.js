// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var clientSchema = mongoose.Schema({
  name : {type : String, default: ''},
  url_name: {type : String, default: ''},
  password: {type : String, default: ''},
  email: {type : String, default: ''},
  phone: {type : String, default: ''},
  type: {type : String, default: 'client'},
  company_name: {type : String, default: ''},
  funds: {type : Number, default: 0},
  funds_used: {type : Number, default: 0},
  website: {type : String, default: ''},
  created: {
    type: Date,
    default: new Date()
  },
  campaigns: [{
    campaign: {
      type: mongoose.Schema.ObjectId,
      ref: 'Campaign'
    },
    campaign_name: String,
  }],
});

// methods ======================
// generating a hash
clientSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
clientSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// makes a url safe name
clientSchema.methods.urlSafeName = function(name) {
    return name.replace(/ /g,"-") + "-" + randomString(8);
};

function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];

  return result;
};

module.exports = mongoose.model('Client', clientSchema);