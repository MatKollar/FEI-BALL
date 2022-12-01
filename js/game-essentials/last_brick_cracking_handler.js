class LastBrickCrackingHandler {
  constructor(timeout, lastBrickRect) {
    // timer setup
    this.timeout = timeout;
    this.timer = new Timer(this.timeout);
    let self = this;
    this.timer.on("end", function () {
      self.handleTimerEnd();
    });
    this.timer.on("update", function () {
      self.handleTimerUpdate();
    });

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

  handleTimerUpdate() {
    let newVolume = interpolate(
      0,
      this.timeout,
      this.baseVolume,
      1.0,
      this.timer.passedSeconds()
    );
    console.log(newVolume);
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  remainingSeconds() {
    return this.timer.remainingSeconds();
  }
}
