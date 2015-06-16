// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called

var phoneNumberSchema = mongoose.Schema({   
	client: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Client' 
    },
    number: {type: String, default: ''},
    business: {type: String, default: ''},
    address: {type: String, default: ''},
    calling: {type: Boolean, default: false},
    called: {type: Boolean, default: false}
});

module.exports = mongoose.model('PhoneNumber', phoneNumberSchema);