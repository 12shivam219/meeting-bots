// bot-engine/video/VideoStreamer.js
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class VideoStreamer {
  constructor(videoPath) {
    this.videoPath = videoPath;
    this.tempY4MPath = path.join('/tmp', `temp_${Date.now()}.y4m`);
  }

  async prepareStream() {
    // Convert video to Y4M format that browsers can use as fake device
    await new Promise((resolve, reject) => {
      ffmpeg(this.videoPath)
        .outputOptions([
          '-pix_fmt yuv420p',
          '-vf scale=640:360',
          '-r 15'
        ])
        .output(this.tempY4MPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Verify the output file
    if (!fs.existsSync(this.tempY4MPath)) {
      throw new Error('Video conversion failed');
    }

    return this.tempY4MPath;
  }

  async cleanup() {
    if (fs.existsSync(this.tempY4MPath)) {
      fs.unlinkSync(this.tempY4MPath);
    }
  }
}


