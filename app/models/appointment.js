// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called

var appointmentSchema = mongoose.Schema({
    client: { type: mongoose.Schema.ObjectId, ref: 'Client' },
    agent: { type: mongoose.Schema.ObjectId, ref: 'Agent' },
    time: Date,
    number: {type: String, default: ''},
    business: {type: String, default: ''},
    address: {type: String, default: ''}
});

module.exports = mongoose.model('Appointment', appointmentSchema);