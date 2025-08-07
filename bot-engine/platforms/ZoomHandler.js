// bot-engine/platforms/ZoomHandler.js
class ZoomHandler {
  constructor(page) {
    this.page = page;
  }

  async join(meetingDetails) {
    // Wait for and fill the name field if present
    await this.page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await this.page.fill('input[type="text"]', 'Meeting Participant');
    
    // Handle different join scenarios
    const joinButton = await this.page.$('button:has-text("Join")');
    if (!joinButton) {
      throw new Error('Join button not found');
    }
    await joinButton.click();

    // Password handling
    if (meetingDetails.password) {
      await this.handlePassword(meetingDetails.password);
    }

    // Wait for meeting to fully load
    await this.waitForMeetingStart();
  }

  async handlePassword(password) {
    try {
      await this.page.waitForSelector('input[type="password"]', { timeout: 5000 });
      await this.page.fill('input[type="password"]', password);
      await this.page.click('button:has-text("Join")');
    } catch (error) {
      throw new Error('Password entry failed: ' + error.message);
    }
  }

  async waitForMeetingStart() {
    // Check for multiple possible indicators that meeting has started
    await Promise.race([
      this.page.waitForSelector('button[aria-label="Mute"]', { timeout: 20000 }),
      this.page.waitForSelector('div[class*="footer-button"]', { timeout: 20000 }),
      this.page.waitForSelector('button[aria-label="Start Video"]', { timeout: 20000 })
    ]);
  }
}