const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threads',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: new Date()
  },
  password: {
    type: String,
    required: true
  },
  reported: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Replies', replySchema);