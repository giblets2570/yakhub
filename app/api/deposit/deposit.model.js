// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called

var depositSchema = mongoose.Schema({
  	amount: Number,
	amount_refunded: Number,
	balance_transaction: String,
	captured: Boolean,
	created: Number,
	currency: String,
	description: String,
	destination: String,
	id: String,
	card: mongoose.Schema.Types.Mixed,
	object: String,
	paid: Boolean,
	status: String,
	client: {
	    type: mongoose.Schema.ObjectId,
	    ref: 'Client'
	},
	client_name: String
});

module.exports = mongoose.model('Deposit', depositSchema);