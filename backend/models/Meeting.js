// backend/models/Meeting.js
const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  password: { type: String },
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  scheduledTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  status: { type: String, enum: ['scheduled', 'attended', 'failed', 'canceled'], default: 'scheduled' },
  error: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meeting', MeetingSchema);