
// backend/routes/meetingRoutes.js
const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const auth = require('../middleware/auth');
const { validateMeeting } = require('../validators/meeting');

router.post('/', auth, validateMeeting, meetingController.createMeeting);
router.get('/', auth, meetingController.getMeetings);
router.delete('/:id', auth, meetingController.deleteMeeting);

module.exports = router;