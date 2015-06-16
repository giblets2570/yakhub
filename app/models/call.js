// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our agent model
// module.exports allows us to pass this to other files when it is called

var callSchema = mongoose.Schema({

	client: { 
		type: mongoose.Schema.ObjectId, 
		ref: 'Client' 
	},
	agent: { 
		type: mongoose.Schema.ObjectId, 
		ref: 'Agent' 
	},
	phoneNumber : { 
		type: mongoose.Schema.ObjectId, 
		ref: 'PhoneNumber'
	},

	number: {type : String, default: ''},
	business: {type : String, default: ''},
	address: {type : String, default: ''},

	personTalkedTo: {type: String, default: ''},

	pickedup: {type: Boolean, default: false},
	
	enthusiasm: Number,
	lead: {type: Boolean, default: false},
	notes: {type : String, default: ''},

	RecordingUrl: {type : String, default: ''},
	duration: {type : String, default: '0'},

	created: {
    	type: Date
    	// default: Date.now()
    }
});

module.exports = mongoose.model('Call', callSchema);