class LastBrickCrackingHandler {
  constructor(timeout, lastBrickRect) {
    // timer setup
    this.timeout = timeout;
    this.timer = new Timer(this.timeout);
    this.callbacks = {};
  }

  handleStagePassed() {
    if (this.timer) {
      this.timer.stop();
      this.timer = undefined;
    }
  }

  handleTimerEnd() {
    if (this.callbacks["end"]) {
      this.callbacks["end"]();
    }
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  remainingSeconds() {
    return this.timer.remainingSeconds();
  }
}
