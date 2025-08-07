// bot-engine/HumanLikeInteractor.js
class HumanLikeInteractor {
  constructor(page) {
    this.page = page;
    this.actionQueue = [];
  }

  async initialize() {
    // Preload common element selectors
    this.selectors = {
      muteButton: await this.detectMuteButton(),
      videoButton: await this.detectVideoButton(),
      chatButton: await this.detectChatButton()
    };
  }

  async performRandomActions() {
    const actions = [
      { name: 'adjust_mic', fn: this.toggleMute.bind(this), weight: 0.3 },
      { name: 'adjust_video', fn: this.toggleVideo.bind(this), weight: 0.2 },
      { name: 'check_chat', fn: this.openChat.bind(this), weight: 0.4 },
      { name: 'look_around', fn: this.moveMouseRandomly.bind(this), weight: 0.8 }
    ];

    // Weighted random selection
    const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedAction;

    for (const action of actions) {
      if (random < action.weight) {
        selectedAction = action;
        break;
      }
      random -= action.weight;
    }

    await selectedAction.fn();
  }

  async toggleMute() {
    try {
      await this.page.click(this.selectors.muteButton);
      await this.page.waitForTimeout(1000 + Math.random() * 2000);
    } catch (error) {
      console.log('Mute toggle failed - maybe already in desired state');
    }
  }
}