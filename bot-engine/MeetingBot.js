// bot-engine/MeetingBot.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class MeetingBot {
  constructor(meetingDetails, videoPath, options = {}) {
    this.id = uuidv4();
    this.meetingDetails = meetingDetails;
    this.videoPath = videoPath;
    this.options = {
      headless: true,
      platform: 'zoom', // 'zoom', 'teams', 'meet'
      ...options
    };
    this.browser = null;
    this.page = null;
    this.logs = [];
  }

  async log(message, level = 'info') {
    const entry = { timestamp: new Date(), level, message };
    this.logs.push(entry);
    console.log(`[${entry.timestamp.toISOString()}] [${level}] ${message}`);
  }

  async initialize() {
    try {
      // Prepare fake video
      await this.prepareVideo();

      // Launch browser
      this.browser = await chromium.launch({
        headless: this.options.headless,
        args: [
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          `--use-file-for-fake-video-capture=${this.videoPath}`,
          '--disable-notifications'
        ]
      });

      // Create context with permissions
      const context = await this.browser.newContext({
        permissions: ['camera', 'microphone'],
        viewport: { width: 1280, height: 720 }
      });

      this.page = await context.newPage();
      await this.log('Browser initialized successfully');
    } catch (error) {
      await this.log(`Initialization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async prepareVideo() {
    // Ensure video exists and is accessible
    if (!fs.existsSync(this.videoPath)) {
      throw new Error(`Video file not found at ${this.videoPath}`);
    }
    await this.log(`Using video file: ${this.videoPath}`);
  }

  async joinMeeting() {
    try {
      await this.log(`Navigating to meeting URL: ${this.meetingDetails.url}`);
      await this.page.goto(this.meetingDetails.url, { waitUntil: 'networkidle' });

      // Platform-specific joining logic
      switch (this.options.platform) {
        case 'zoom':
          await this.handleZoom();
          break;
        case 'teams':
          await this.handleTeams();
          break;
        case 'meet':
          await this.handleMeet();
          break;
        default:
          await this.handleGeneric();
      }

      await this.log('Successfully joined meeting');
      return true;
    } catch (error) {
      await this.log(`Failed to join meeting: ${error.message}`, 'error');
      throw error;
    }
  }

  async handleZoom() {
    // Wait for join button and click
    await this.page.waitForSelector('button:has-text("Join")', { timeout: 10000 });
    await this.page.click('button:has-text("Join")');

    // Handle password if provided
    if (this.meetingDetails.password) {
      await this.page.waitForSelector('input[type="password"]', { timeout: 5000 });
      await this.page.fill('input[type="password"]', this.meetingDetails.password);
      await this.page.click('button:has-text("Join")');
    }

    // Wait for meeting to load
    await this.page.waitForSelector('button[aria-label="Mute"]', { timeout: 15000 });
    
    // Mute microphone
    await this.page.click('button[aria-label="Mute"]');
  }

  async handleTeams() {
    // Teams-specific joining logic
    await this.page.waitForSelector('button[data-tid="prejoin-join-button"]', { timeout: 10000 });
    await this.page.click('button[data-tid="prejoin-join-button"]');

    // Wait for meeting controls
    await this.page.waitForSelector('button[data-tid="toggle-mute"]', { timeout: 15000 });
    
    // Mute if not already muted
    const muteButton = await this.page.$('button[data-tid="toggle-mute"]');
    const isMuted = await muteButton.getAttribute('aria-pressed');
    if (isMuted === 'false') {
      await muteButton.click();
    }
  }

  async leaveMeeting() {
    try {
      if (!this.page) return;

      // Platform-specific leave logic
      switch (this.options.platform) {
        case 'zoom':
          await this.page.click('button[aria-label="Leave meeting"]');
          break;
        case 'teams':
          await this.page.click('button[data-tid="call-hangup"]');
          break;
        case 'meet':
          await this.page.click('button[aria-label="Leave call"]');
          break;
        default:
          await this.page.close();
      }

      await this.log('Left the meeting successfully');
    } catch (error) {
      await this.log(`Error while leaving meeting: ${error.message}`, 'error');
    } finally {
      if (this.browser) await this.browser.close();
    }
  }

  async simulateActivity() {
    // Randomly perform actions to simulate human behavior
    const actions = [
      { name: 'small head movement', action: async () => {
        await this.page.mouse.move(100, 100);
        await this.page.mouse.move(110, 110);
      }},
      { name: 'check participants', action: async () => {
        await this.page.click('button[aria-label="Show Participants"]');
        await this.page.waitForTimeout(2000);
        await this.page.click('button[aria-label="Hide Participants"]');
      }},
      { name: 'toggle mute', action: async () => {
        await this.page.click('button[aria-label="Mute"]');
        await this.page.waitForTimeout(1000);
        await this.page.click('button[aria-label="Unmute"]');
      }}
    ];

    const action = actions[Math.floor(Math.random() * actions.length)];
    await this.log(`Simulating activity: ${action.name}`);
    await action.action();
  }

  async run() {
    try {
      await this.initialize();
      await this.joinMeeting();

      // Stay in meeting for duration
      const startTime = Date.now();
      const durationMs = this.meetingDetails.duration * 60 * 1000;

      while (Date.now() - startTime < durationMs) {
        await this.page.waitForTimeout(60000); // Wait 1 minute
        if (Math.random() > 0.7) { // 30% chance of activity
          await this.simulateActivity();
        }
      }

      await this.leaveMeeting();
      return { success: true, logs: this.logs };
    } catch (error) {
      await this.leaveMeeting();
      return { success: false, error: error.message, logs: this.logs };
    }
  }
}

module.exports = MeetingBot;