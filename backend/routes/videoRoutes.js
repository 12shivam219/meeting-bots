
// backend/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('video'), videoController.uploadVideo);
router.get('/', auth, videoController.getVideos);
router.delete('/:id', auth, videoController.deleteVideo);

module.exports = router;