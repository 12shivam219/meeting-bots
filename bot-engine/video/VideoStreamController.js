

// bot-engine/video/VideoStreamController.js
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { EventEmitter } = require('events');

class VideoStreamController extends EventEmitter {
  constructor(videoPath) {
    super();
    this.videoPath = videoPath;
    this.streamProcess = null;
    this.pipePath = path.join('/tmp', `video_pipe_${Date.now()}.y4m`);
    this.isStreaming = false;
  }

  async startStream() {
    if (this.isStreaming) return;
    
    try {
      // Create named pipe (FIFO)
      await fs.promises.mkfifo(this.pipePath, 0o666);
      
      // Start FFmpeg streaming process
      this.streamProcess = ffmpeg(this.videoPath)
        .outputOptions([
          '-pix_fmt yuv420p',
          '-vf fps=15,scale=640:360',
          '-re',               // Native framerate
          '-loop 1',           // Loop for static images
          '-t 00:30:00'        // Max 30 minute streams
        ])
        .output(this.pipePath)
        .on('start', (cmd) => {
          this.isStreaming = true;
          this.emit('start', cmd);
        })
        .on('error', (err) => {
          this.emit('error', err);
          this.cleanup();
        })
        .on('end', () => {
          this.emit('end');
          this.cleanup();
        });
      
      this.streamProcess.run();
      
      return this.pipePath;
    } catch (err) {
      this.cleanup();
      throw err;
    }
  }

  async adjustQuality(networkQuality) {
    // networkQuality: 0 (worst) to 1 (best)
    const bitrate = this.calculateBitrate(networkQuality);
    const fps = Math.max(10, Math.min(30, Math.floor(5 + networkQuality * 25)));
    
    if (this.streamProcess) {
      // Send FFmpeg quality adjustment commands
      this.streamProcess.ffmpegProc.stdin.write(`
        [v]setpts=0.5*PTS,scale=w=640:h=360:force_original_aspect_ratio=decrease[fps];
        [fps]fps=${fps}[out]
      `);
    }
  }

  calculateBitrate(quality) {
    return Math.floor(300 + 1700 * quality); // 300-2000 kbps
  }

  async cleanup() {
    this.isStreaming = false;
    
    if (this.streamProcess) {
      this.streamProcess.kill('SIGTERM');
      this.streamProcess = null;
    }
    
    try {
      if (this.pipePath && fs.existsSync(this.pipePath)) {
        await fs.promises.unlink(this.pipePath);
      }
    } catch (err) {
      console.error('Pipe cleanup error:', err);
    }
  }
}

module.exports = VideoStreamController;