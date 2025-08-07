// backend/validators/meeting.js
const { check } = require('express-validator');

exports.validateMeeting = [
  check('title', 'Title is required').notEmpty(),
  check('platform', 'Platform is required').isIn(['zoom', 'teams', 'meet']),
  check('link', 'Valid URL is required').isURL(),
  check('scheduledTime', 'Valid date is required').isISO8601(),
  check('duration', 'Duration must be between 5-240 minutes').isInt({ min: 5, max: 240 }),
  check('videoId', 'Video ID is required').isMongoId()
];