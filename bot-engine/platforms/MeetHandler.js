// bot-engine/platforms/MeetHandler.js
const EventEmitter = require('events');
const { sleep } = require('../utils');

class MeetHandler extends EventEmitter {
  constructor(page) {
    super();
    this.page = page;
    this.selectors = {
      joinButton: 'button:has-text("Join now")',
      muteButton: 'button[aria-label="Turn off microphone"]',
      videoButton: 'button[aria-label="Turn off camera"]',
      leaveButton: 'button[aria-label="Leave call"]',
      chatButton: 'button[aria-label="Open chat"]'
    };
  }

  async join(meetingDetails) {
    try {
      // Handle possible dial-in screen
      await this.page.waitForLoadState('networkidle');
      
      // Click join button if present
      const joinBtn = await this.page.$(this.selectors.joinButton);
      if (joinBtn) {
        await joinBtn.click();
        await sleep(3000);
      }
      
      // Wait for meeting controls
      await this.page.waitForSelector(this.selectors.muteButton, { timeout: 20000 });
      
      // Mute microphone
      await this.toggleMute(true);
      
      this.emit('joined');
      return true;
    } catch (error) {
      this.emit('error', `Meet join failed: ${error.message}`);
      return false;
    }
  }

  async toggleMute(mute = true) {
    try {
      const button = await this.page.$(this.selectors.muteButton);
      const currentLabel = await button.getAttribute('aria-label');
      
      if ((mute && currentLabel.includes('off')) {
        await button.click();
        await sleep(1000);
      } else if (!mute && currentLabel.includes('on')) {
        await button.click();
        await sleep(1000);
      }
    } catch (error) {
      this.emit('error', `Mute toggle failed: ${error.message}`);
    }
  }

  async leave() {
    try {
      await this.page.click(this.selectors.leaveButton);
      await sleep(1000);
      
      // Confirm leave if needed
      const confirmButton = await this.page.$('button:has-text("Leave")');
      if (confirmButton) {
        await confirmButton.click();
      }
      
      this.emit('left');
      return true;
    } catch (error) {
      this.emit('error', `Meet leave failed: ${error.message}`);
      return false;
    }
  }

  async simulateActivity() {
    try {
      // Randomly open/close chat
      if (Math.random() > 0.8) {
        await this.page.click(this.selectors.chatButton);
        await sleep(4000);
        await this.page.click(this.selectors.chatButton);
      }
      
      // Occasionally adjust video
      if (Math.random() > 0.9) {
        await this.page.click(this.selectors.videoButton);
        await sleep(3000);
        await this.page.click(this.selectors.videoButton);
      }
    } catch (error) {
      this.emit('error', `Activity simulation failed: ${error.message}`);
    }
  }
}

module.exports = MeetHandler;