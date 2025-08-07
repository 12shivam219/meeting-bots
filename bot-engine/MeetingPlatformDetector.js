
// bot-engine/MeetingPlatformDetector.js
class MeetingPlatformDetector {
  static async detect(page) {
    const url = await page.url();
    
    // URL pattern matching
    if (url.includes('zoom.us/j/')) return 'zoom';
    if (url.includes('teams.microsoft.com')) return 'teams';
    if (url.includes('meet.google.com')) return 'meet';
    if (url.includes('webex.com')) return 'webex';
    
    // DOM element detection as fallback
    try {
      const zoomElements = await page.$$('div[class*="zoom-app"]');
      if (zoomElements.length > 0) return 'zoom';
      
      const teamsElements = await page.$$('div[class*="teams-app"]');
      if (teamsElements.length > 0) return 'teams';
    } catch (error) {
      console.error('Detection failed:', error);
    }
    
    return 'unknown';
  }

  static getHandler(platform) {
    switch (platform) {
      case 'zoom': return require('./ZoomHandler');
      case 'teams': return require('./TeamsHandler');
      case 'meet': return require('./MeetHandler');
      default: return require('./GenericHandler');
    }
  }
}