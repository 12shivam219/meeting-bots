// backend/services/scheduler.js
const { Queue } = require('bull');
const Meeting = require('../models/Meeting');
const MeetingBot = require('../../bot-engine/MeetingBot');

const meetingQueue = new Queue('meetings', {
  redis: process.env.REDIS_URL
});

const scheduleMeetingJob = async (meeting) => {
  const video = await Video.findById(meeting.video);
  
  await meetingQueue.add(
    { meetingId: meeting._id },
    {
      delay: new Date(meeting.scheduledTime) - Date.now(),
      attempts: 3,
      backoff: { type: 'exponential', delay: 60000 },
      removeOnComplete: true
    }
  );
};

meetingQueue.process(async (job) => {
  const meeting = await Meeting.findById(job.data.meetingId);
  const video = await Video.findById(meeting.video);
  
  try {
    const bot = new MeetingBot({
      platform: meeting.platform,
      meetingUrl: meeting.link,
      password: meeting.password,
      duration: meeting.duration,
      videoPath: video.processedPath
    });

    await bot.run();
    
    meeting.status = 'completed';
    await meeting.save();
  } catch (error) {
    meeting.status = 'failed';
    meeting.error = error.message;
    await meeting.save();
    throw error;
  }
});

module.exports = { scheduleMeetingJob };