// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called
var nuggetSchema = mongoose.Schema({
	client: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Client' 
    },
    agent: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Agent' 
    },
    text: String
});

module.exports = mongoose.model('Nugget', nuggetSchema);