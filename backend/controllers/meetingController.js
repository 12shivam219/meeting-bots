
// backend/controllers/meetingController.js
const Meeting = require('../models/Meeting');
const Video = require('../models/Video');
const { scheduleMeetingJob } = require('../services/scheduler');

exports.createMeeting = async (req, res) => {
  try {
    const { title, platform, link, password, scheduledTime, duration, videoId } = req.body;
    
    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const meeting = new Meeting({
      title,
      platform,
      link,
      password,
      scheduledTime: new Date(scheduledTime),
      duration,
      video: videoId,
      user: req.user._id
    });

    await meeting.save();
    
    // Schedule the bot to join
    await scheduleMeetingJob(meeting);

    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ user: req.user._id })
      .populate('video')
      .sort({ scheduledTime: 1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // TODO: Cancel scheduled job

    res.json({ message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};