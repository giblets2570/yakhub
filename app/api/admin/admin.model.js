// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define our agent model
// module.exports allows us to pass this to other files when it is called

var adminSchema = mongoose.Schema({
  name: {type : String, default: ''},
  url_name: {type : String, default: ''},
  password: {type : String, default: ''},
  type: {type : String, default: 'admin'}
});

// methods ======================
// generating a hash
adminSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
adminSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// makes a url safe name
adminSchema.methods.urlSafeName = function(name) {
    return name.replace(/ /g,"-") + "-" + randomString(8);
};

function randomString(length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];

  return result;
};

module.exports = mongoose.model('Admin', adminSchema);