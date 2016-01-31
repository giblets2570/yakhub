// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called

var messageSchema = mongoose.Schema({
  campaign: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign'
  },
  campaign_name: String,
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  },
  last_message: Date,
  client_name: String,
  messages:[{
    text: String,
    time: {
      type: Date,
      default: new Date()
    }
  }],
  created: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model('Message', messageSchema);