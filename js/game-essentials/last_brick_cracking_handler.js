/* global Timer interpolate Thunder */

class LastBrickCrackingHandler {
  constructor(timeout, lastBrickRect) {
    // timer setup
    this.timeout = timeout;
    this.timer = new Timer(this.timeout);
    var self = this;
    this.timer.on("end", function () {
      self.handleTimerEnd();
    });
    this.timer.on("update", function () {
      self.handleTimerUpdate();
    });

    var lastBrickCenterPoint = {
      x: lastBrickRect.x + lastBrickRect.width / 2,
      y: lastBrickRect.y + lastBrickRect.height / 2,
    };

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
    var newVolume = interpolate(
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
  draw(ctx) {
    if (this.timer.remainingSeconds() < 1) {
      // draw thunder for last 1 seconds
    }
  }
}
