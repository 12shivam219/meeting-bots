// bot-engine/video/VideoEnhancer.js
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

class VideoEnhancer {
  static async enhance(inputPath, outputDir, options = {}) {
    const {
      noiseLevel = 0.1,
      colorVariation = 0.05,
      brightnessVariation = 0.03,
      fps = 15
    } = options;
    
    try {
      await mkdir(outputDir, { recursive: true });
      const outputPath = path.join(outputDir, `enhanced_${path.basename(inputPath)}`);
      
      // Generate random variations for each enhancement
      const variations = {
        noise: Math.random() * noiseLevel,
        hue: (Math.random() * 2 - 1) * colorVariation * 360,
        saturation: 1 + (Math.random() * 2 - 1) * colorVariation,
        brightness: (Math.random() * 2 - 1) * brightnessVariation,
        contrast: 1 + (Math.random() * 2 - 1) * 0.05
      };
      
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .videoFilters([
            `noise=alls=${variations.noise}:allf=t`,
            `hue=h=${variations.hue}:s=${variations.saturation}`,
            `eq=brightness=${variations.brightness}:contrast=${variations.contrast}`,
            `fps=${fps}`
          ])
          .outputOptions([
            '-c:v libx264',
            '-preset fast',
            '-crf 23',
            '-pix_fmt yuv420p',
            '-movflags +faststart'
          ])
          .on('end', () => resolve(outputPath))
          .on('error', reject)
          .save(outputPath);
      });
      
      return outputPath;
    } catch (error) {
      // Cleanup on error
      if (outputPath && fs.existsSync(outputPath)) {
        await unlink(outputPath);
      }
      throw error;
    }
  }

  static async createVariations(inputPath, outputDir, count = 3) {
    const variations = [];
    try {
      for (let i = 0; i < count; i++) {
        const variation = await this.enhance(inputPath, outputDir, {
          noiseLevel: 0.15,
          colorVariation: 0.1,
          brightnessVariation: 0.05
        });
        variations.push(variation);
      }
      return variations;
    } catch (error) {
      // Cleanup any created files if error occurs
      await Promise.all(variations.map(v => unlink(v).catch(() => {})));
      throw error;
    }
  }
}

module.exports = VideoEnhancer;