// backend/services/VideoStorageService.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const ffmpeg = require('fluent-ffmpeg');

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

class VideoStorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../shared_videos/uploads');
    this.processedDir = path.join(__dirname, '../../shared_videos/processed');
  }

  async getUploadedVideos() {
    try {
      const files = await readdir(this.uploadDir);
      return files.map(file => ({
        name: file,
        path: path.join(this.uploadDir, file)
      }));
    } catch (err) {
      throw new Error(`Failed to read upload directory: ${err.message}`);
    }
  }

  async getProcessedVideos() {
    try {
      const files = await readdir(this.processedDir);
      return files.map(file => ({
        name: file,
        path: path.join(this.processedDir, file)
      }));
    } catch (err) {
      throw new Error(`Failed to read processed directory: ${err.message}`);
    }
  }

  async processVideo(inputPath, outputFilename, options = {}) {
    const outputPath = path.join(this.processedDir, outputFilename);
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-crf 23',
          '-pix_fmt yuv420p',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Video processing failed: ${err.message}`)))
        .run();
    });
  }

  async cleanupOldFiles(maxAgeHours = 24) {
    const now = Date.now();
    const cutoff = now - (maxAgeHours * 60 * 60 * 1000);
    
    const cleanupDirectory = async (dir) => {
      const files = await readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await stat(filePath);
        
        if (stats.mtimeMs < cutoff) {
          await unlink(filePath);
          console.log(`Deleted old file: ${filePath}`);
        }
      }
    };

    await Promise.all([
      cleanupDirectory(this.uploadDir),
      cleanupDirectory(this.processedDir)
    ]);
  }
}

module.exports = new VideoStorageService();