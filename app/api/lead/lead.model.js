// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called

var leadSchema = mongoose.Schema({
	campaign: {
        type: mongoose.Schema.ObjectId,
        ref: 'Campaign'
    },
    client: {
        type: mongoose.Schema.ObjectId,
        ref: 'Client'
    },
    agent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Agent',
        default: null
    },
    number: {type: String, default: ''},
    company: {type: String, default: ''},
    person: {
        name: {type: String, default: ''},
        role: {type: String, default: ''}
    },
    address: {type: String, default: ''},
    email: {type: String, default: ''},
    outcome: {type: String, default: ''},
    notes: {type: String, default: ''},
    called: {type: Boolean, default: false},
    call_timestamp: Date,
    call_back: Date,
    created: {
        type: Date,
        default: new Date()
    },
});

module.exports = mongoose.model('Lead', leadSchema);