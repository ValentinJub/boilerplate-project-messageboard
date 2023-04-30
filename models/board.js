const mongoose = require('mongoose');

// how can I use objectID in threads => board

const boardSchema = new mongoose.Schema({
  text: { 
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('Boards', boardSchema);