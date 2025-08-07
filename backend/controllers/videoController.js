// backend/controllers/videoController.js
const Video = require('../models/Video');
const VideoProcessor = require('../services/VideoProcessor');
const fs = require('fs');
const path = require('path');

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { originalname, mimetype } = req.file;
    
    // Process video
    const processed = await VideoProcessor.processUpload(
      req.file, 
      req.user._id.toString()
    );

    // Save to database
    const video = new Video({
      name: originalname,
      mimeType: mimetype,
      originalPath: processed.originalPath,
      processedPath: processed.processedPath,
      duration: processed.duration,
      user: req.user._id
    });

    await video.save();

    res.status(201).json(video);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user._id });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete files
    [video.originalPath, video.processedPath].forEach(path => {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    });

    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};