// grab the mongoose module
var mongoose = require('mongoose');

// module.exports allows us to pass this to other files when it is called

var callSchema = mongoose.Schema({

	// Info on client
	client: {
		type: mongoose.Schema.ObjectId,
		ref: 'Client'
	},
	client_name: {type: String, default: ''},

	// Info on agent
	agent: {
		type: mongoose.Schema.ObjectId,
		ref: 'Agent'
	},
	agent_name: {type: String, default: ''},

	// Info on campaign
	campaign : {
		type: mongoose.Schema.ObjectId,
		ref: 'Campaign'
	},
	campaign_name: {type: String, default: ''},

	created: {
    	type: Date,
    	default: new Date()
    },

	// Lead information
	lead_info:{
		number: {type : String, default: ''},
		company: {type : String, default: ''},
		address: {type : String, default: ''},
		email: {type : String, default: ''},
		person: {
			name: String,
			role: String
		},
	},

	// Data from the call
	contact_info: {
		number: {type : String, default: ''},
		company: {type : String, default: ''},
		email: {type : String, default: ''},
		person: {
			name: String,
			role: String
		},
	},

	// Data from twilio
	recording_url: {type : String, default: ''},
	duration : {type : Number, default: 0},
	status : {type : String, default: ''},
	fee : {type : Number, default: 0},
	// Client driven data from the call
	followed_up: {type : Boolean, default: false},

	// Agent driven data from the call
	notes: {type : String, default: ''},
	rating: Number,
	outcome: {type: String, default: ''},
	answers : {
		type: [{
			question: String,
			answer: String
		}],
		default: []
	}
});

module.exports = mongoose.model('Call', callSchema);