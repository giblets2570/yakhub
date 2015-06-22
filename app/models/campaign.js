// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called

var campaignSchema = mongoose.Schema({
    client: {type: mongoose.Schema.ObjectId, ref: 'Client' },
    num_hours: {type: Number, default: 0},
    assignments: [{
    	agent: {type: mongoose.Schema.ObjectId, ref: 'Agent' },
    	time: Date
    }]
});

module.exports = mongoose.model('Campaign', campaignSchema);