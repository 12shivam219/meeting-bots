// backend/services/VideoProcessor.js
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdirAsync = promisify(fs.mkdir);
const unlinkAsync = promisify(fs.unlink);

class VideoProcessor {
  static async processUpload(file, userId, options = {}) {
    const { minDuration = 300, maxDuration = 1800 } = options;
    const tempPath = file.path;
    const outputDir = path.join(__dirname, '../../shared_videos/processed', userId);
    
    try {
      // Create user directory if not exists
      await mkdirAsync(outputDir, { recursive: true });

      // Generate unique filename
      const outputFilename = `processed_${Date.now()}.mp4`;
      const outputPath = path.join(outputDir, outputFilename);

      // 1. First pass: Analyze video
      const metadata = await this.getVideoMetadata(tempPath);
      
      // 2. Second pass: Create optimized looping video
      await this.createOptimizedLoop(
        tempPath, 
        outputPath, 
        metadata, 
        { minDuration, maxDuration }
      );

      // 3. Optional third pass: Add realistic variations
      const enhancedPath = await this.addRealisticVariations(outputPath);

      return {
        originalPath: tempPath,
        processedPath: enhancedPath || outputPath,
        duration: Math.min(maxDuration, Math.max(minDuration, metadata.format.duration * 3))
      };
    } catch (error) {
      // Cleanup on error
      await this.cleanupTempFiles([tempPath, outputPath]);
      throw error;
    }
  }

  static async getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(new Error(`Video analysis failed: ${err.message}`));
        resolve(metadata);
      });
    });
  }

  static async createOptimizedLoop(inputPath, outputPath, metadata, { minDuration, maxDuration }) {
    const originalDuration = metadata.format.duration;
    const targetDuration = Math.min(maxDuration, Math.max(minDuration, originalDuration * 3));
    const loops = Math.ceil(targetDuration / originalDuration);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions([`-stream_loop ${loops}`])
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-crf 22',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
          '-vf fps=30,scale=640:360',
          `-t ${targetDuration}`
        ])
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });
  }

  static async addRealisticVariations(videoPath) {
    const outputPath = videoPath.replace('.mp4', '_enhanced.mp4');
    
    try {
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .videoFilters([
            'colorchannelmixer=.9:.9:.9',  // Slight desaturation
            'noise=alls=20:allf=t+u',     // Subtle film grain
            'hue=h=2:s=1',                // Minor color variation
            'eq=brightness=0.03:contrast=1.01' // Slight adjustments
          ])
          .outputOptions([
            '-c:a copy', // Keep original audio
            '-preset fast'
          ])
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });
      return outputPath;
    } catch (error) {
      console.error('Enhancement failed, using original:', error);
      return videoPath;
    }
  }

  static async cleanupTempFiles(filePaths) {
    await Promise.all(
      filePaths.map(async path => {
        try {
          if (path && fs.existsSync(path)) await unlinkAsync(path);
        } catch (err) {
          console.error(`Error deleting ${path}:`, err);
        }
      })
    );
  }
}

module.exports = VideoProcessor;