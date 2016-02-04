// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called

var paymentSchema = mongoose.Schema({
  	amount: Number,
	amount_reversed: Number,
	balance_transaction: String,
	created: Number,
	currency: String,
	date: Number,
	description: String,
	destination: String,
	destination_payment: String,
	id: String,
	object: String,
	status: String,
	type: String,
	agent: {
	    type: mongoose.Schema.ObjectId,
	    ref: 'Agent'
	},
	agent_name: String
});

module.exports = mongoose.model('Payment', paymentSchema);