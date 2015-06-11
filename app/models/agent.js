// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define our agent model
// module.exports allows us to pass this to other files when it is called

var agentSchema = mongoose.Schema({
    name : {type : String, default: ''},
    password: {type : String, default: ''},
    email: {type : String, default: ''},
    calling: {
        call_id: {type: mongoose.Schema.ObjectId, ref: 'Call'},
        phone_number_id: {type: mongoose.Schema.ObjectId, ref: 'PhoneNumber'}
    },
    client: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Client' 
    },
    created: {
    	type: Date,
    	default: Date.now()
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

module.exports = mongoose.model('Agent', agentSchema);