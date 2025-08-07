// bot-engine/StealthEnhancer.js
class StealthEnhancer {
  static async enhancePage(page) {
    // Randomize viewport dimensions
    const widths = [1280, 1366, 1440, 1536, 1600, 1920];
    const heights = [720, 768, 800, 864, 900, 1080];
    const randomWidth = widths[Math.floor(Math.random() * widths.length)];
    const randomHeight = heights[Math.floor(Math.random() * heights.length)];
    
    await page.setViewportSize({
      width: randomWidth,
      height: randomHeight,
      deviceScaleFactor: Math.random() * 3 + 1 // 1-4
    });

    // Override WebGL vendor/renderer
    await page.addInitScript(() => {
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.'; // VENDOR
        if (parameter === 37446) return 'Intel Iris OpenGL Engine'; // RENDERER
        return getParameter.call(this, parameter);
      };
    });

    // Disable permissions prompt
    await page.context().overridePermissions('<your_meeting_url>', [
      'camera',
      'microphone'
    ]);

    // Randomize mouse movements
    await this.randomizeMouseMovements(page);
  }

  static async randomizeMouseMovements(page) {
    const moveMouse = async () => {
      const x = Math.random() * await page.viewportSize().width;
      const y = Math.random() * await page.viewportSize().height;
      await page.mouse.move(x, y);
      
      // Schedule next movement randomly between 5-30 seconds
      setTimeout(moveMouse, Math.random() * 25000 + 5000);
    };
    moveMouse();
  }
}