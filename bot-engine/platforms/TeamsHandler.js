// bot-engine/platforms/TeamsHandler.js
const EventEmitter = require('events');
const { sleep } = require('../utils');

class TeamsHandler extends EventEmitter {
  constructor(page) {
    super();
    this.page = page;
    this.selectors = {
      joinButton: 'button[data-tid="prejoin-join-button"]',
      muteButton: 'button[data-tid="toggle-mute"]',
      videoButton: 'button[data-tid="toggle-video"]',
      leaveButton: 'button[data-tid="call-hangup"]',
      participantList: 'button[data-tid="roster-button"]'
    };
  }

  async join(meetingDetails) {
    try {
      // Wait for and click join button
      await this.page.waitForSelector(this.selectors.joinButton, { timeout: 15000 });
      await this.page.click(this.selectors.joinButton);
      
      // Wait for meeting to load
      await this.page.waitForSelector(this.selectors.muteButton, { timeout: 20000 });
      
      // Mute microphone
      await this.toggleMute(true);
      
      this.emit('joined');
      return true;
    } catch (error) {
      this.emit('error', `Teams join failed: ${error.message}`);
      return false;
    }
  }

  async toggleMute(mute = true) {
    try {
      const currentState = await this.page.$eval(
        this.selectors.muteButton,
        el => el.getAttribute('aria-pressed')
      );
      
      if ((mute && currentState === 'false') || (!mute && currentState === 'true')) {
        await this.page.click(this.selectors.muteButton);
        await sleep(1000);
      }
    } catch (error) {
      this.emit('error', `Mute toggle failed: ${error.message}`);
    }
  }

  async leave() {
    try {
      await this.page.click(this.selectors.leaveButton);
      await sleep(2000);
      this.emit('left');
      return true;
    } catch (error) {
      this.emit('error', `Teams leave failed: ${error.message}`);
      return false;
    }
  }

  async simulateActivity() {
    try {
      // Randomly check participant list
      if (Math.random() > 0.7) {
        await this.page.click(this.selectors.participantList);
        await sleep(3000);
        await this.page.click(this.selectors.participantList);
      }
      
      // Occasionally toggle video
      if (Math.random() > 0.9) {
        await this.page.click(this.selectors.videoButton);
        await sleep(2000);
        await this.page.click(this.selectors.videoButton);
      }
    } catch (error) {
      this.emit('error', `Activity simulation failed: ${error.message}`);
    }
  }
}

module.exports = TeamsHandler;