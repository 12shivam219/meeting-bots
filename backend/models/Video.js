// backend/models/Video.js
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const unlink = promisify(fs.unlink);

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

// Delete associated files when video is removed
VideoSchema.pre('remove', async function(next) {
  try {
    const paths = [this.originalPath, this.processedPath];
    for (const filePath of paths) {
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Video', VideoSchema);