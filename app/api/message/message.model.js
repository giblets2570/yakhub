// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called

var messageSchema = mongoose.Schema({
  name: {type: String, default: ''},
  clients:[{
    client: {
      type: mongoose.Schema.ObjectId,
      ref: 'Client'
    },
    client_name: String,
    last_check: Date
  }],
  agents:[{
    agent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Agent'
    },
    agent_name: String,
    last_check: Date
  }],
  last_message: Date,
  messages:[{
    text: String,
    time: {
      type: Date,
      default: new Date()
    },
    user_type: String,
    agent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Agent'
    },
    agent_name: String,
    client: {
      type: mongoose.Schema.ObjectId,
      ref: 'Client'
    },
    client_name: String
  }],
  created: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model('Message', messageSchema);