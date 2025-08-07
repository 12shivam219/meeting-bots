// backend/models/Video.js
const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mimeType: { type: String, required: true },
  originalPath: { type: String, required: true },
  processedPath: { type: String, required: true },
  duration: { type: Number, required: true }, // in seconds
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', VideoSchema);