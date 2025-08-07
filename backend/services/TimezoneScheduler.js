// backend/services/TimezoneScheduler.js
const { Queue } = require('bull');
const moment = require('moment-timezone');
const User = require('../models/User');

class TimezoneScheduler {
  constructor() {
    this.queue = new Queue('meetings', {
      redis: { port: 6379, host: 'redis' }
    });
  }

  async scheduleMeeting(meeting) {
    const user = await User.findById(meeting.user);
    if (!user) throw new Error('User not found');

    // Convert to user's timezone
    const userTime = moment(meeting.scheduledTime).tz(user.timezone);
    const now = moment().tz(user.timezone);
    
    // Calculate delay in milliseconds
    const delay = Math.max(0, userTime.diff(now));

    // Schedule with exponential backoff retry
    await this.queue.add(
      { meetingId: meeting._id },
      {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000 // 1 minute
        },
        removeOnComplete: true,
        removeOnFail: 100 // Keep last 100 failed jobs
      }
    );

    return {
      scheduledTime: userTime.format(),
      timezone: user.timezone,
      delayMs: delay
    };
  }
}