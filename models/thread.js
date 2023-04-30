const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boards',
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
  bumped_on: {
    type: Date,
    default: new Date()
  },
  reported: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  replies: [{
    type: Object,
    default: []
  }]
});

module.exports = mongoose.model('Threads', threadSchema);