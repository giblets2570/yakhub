// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var clientSchema = mongoose.Schema({
	name : {type : String, default: ''},
    password: {type : String, default: ''},
    email: {type : String, default: ''},
    website: {type : String, default: ''},
    created: {
    	type: Date,
    	default: Date.now()
    },leads:[{
        call_id: {type: mongoose.Schema.ObjectId, ref: 'Call'},
        notes: {type : String, default: ''},
        followed: {type : Boolean, default: false}
    }]
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

module.exports = mongoose.model('Client', clientSchema);