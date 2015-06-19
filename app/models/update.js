// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called

var updateSchema = mongoose.Schema({
    client: {type: mongoose.Schema.ObjectId, ref: 'Client' },
    update: {type: String, default: ""},
    admin: {type: Boolean, default: false},
    created: {
    	type: Date,
    	default: Date.now()
    }
});

module.exports = mongoose.model('Update', updateSchema);