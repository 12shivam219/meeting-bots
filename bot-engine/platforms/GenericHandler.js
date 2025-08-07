// bot-engine/platforms/GenericHandler.js
const EventEmitter = require('events');
const { sleep } = require('../utils');

class GenericHandler extends EventEmitter {
  constructor(page) {
    super();
    this.page = page;
    this.selectors = {
      mediaButtons: [
        'button[aria-label*="microphone"]',
        'button[aria-label*="camera"]',
        'button[title*="microphone"]',
        'button[title*="camera"]'
      ],
      leaveButtons: [
        'button[aria-label*="leave"]',
        'button[title*="leave"]',
        'button:has-text("Leave")'
      ]
    };
  }

  async join(meetingDetails) {
    try {
      // Wait for page to load
      await this.page.waitForLoadState('networkidle');
      await sleep(3000);
      
      // Try to find and click join button
      const joinButtons = await this.page.$$('button:has-text("Join"), button:has-text("Enter")');
      if (joinButtons.length > 0) {
        await joinButtons[0].click();
        await sleep(3000);
      }
      
      // Try to mute
      await this.toggleMute(true);
      
      this.emit('joined');
      return true;
    } catch (error) {
      this.emit('error', `Generic join failed: ${error.message}`);
      return false;
    }
  }

  async toggleMute(mute = true) {
    try {
      for (const selector of this.selectors.mediaButtons) {
        const buttons = await this.page.$$(selector);
        for (const button of buttons) {
          const label = await button.getAttribute('aria-label') || 
                       await button.getAttribute('title') || '';
          
          if (label.toLowerCase().includes('microphone')) {
            const currentState = label.includes('off') || label.includes('unmute');
            if ((mute && !currentState) || (!mute && currentState)) {
              await button.click();
              await sleep(1000);
              return;
            }
          }
        }
      }
    } catch (error) {
      this.emit('error', `Generic mute toggle failed: ${error.message}`);
    }
  }

  async leave() {
    try {
      for (const selector of this.selectors.leaveButtons) {
        const buttons = await this.page.$$(selector);
        if (buttons.length > 0) {
          await buttons[0].click();
          await sleep(2000);
          this.emit('left');
          return true;
        }
      }
      
      // Fallback to closing tab
      await this.page.close();
      this.emit('left');
      return true;
    } catch (error) {
      this.emit('error', `Generic leave failed: ${error.message}`);
      return false;
    }
  }

  async simulateActivity() {
    try {
      // Random mouse movements
      if (Math.random() > 0.7) {
        const viewport = this.page.viewportSize();
        const x = Math.random() * viewport.width;
        const y = Math.random() * viewport.height;
        await this.page.mouse.move(x, y);
      }
      
      // Occasionally toggle video
      if (Math.random() > 0.9) {
        for (const selector of this.selectors.mediaButtons) {
          const buttons = await this.page.$$(selector);
          for (const button of buttons) {
            const label = await button.getAttribute('aria-label') || 
                         await button.getAttribute('title') || '';
            
            if (label.toLowerCase().includes('camera')) {
              await button.click();
              await sleep(3000);
              await button.click();
              return;
            }
          }
        }
      }
    } catch (error) {
      this.emit('error', `Activity simulation failed: ${error.message}`);
    }
  }
}

module.exports = GenericHandler;