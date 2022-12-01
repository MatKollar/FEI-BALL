/* global Timer interpolate Thunder */

function LastBrickCrackingHandler(timeout, lastBrickRect) {
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

LastBrickCrackingHandler.prototype.handleStagePassed = function () {
  if (this.timer) {
    this.timer.stop();
    this.timer = undefined;
  }
};

LastBrickCrackingHandler.prototype.handleTimerEnd = function () {
  if (this.callbacks["end"]) {
    this.callbacks["end"]();
  }
};

LastBrickCrackingHandler.prototype.handleTimerUpdate = function () {
  var newVolume = interpolate(
    0,
    this.timeout,
    this.baseVolume,
    1.0,
    this.timer.passedSeconds()
  );
  console.log(newVolume);
};

LastBrickCrackingHandler.prototype.on = function (event, callback) {
  this.callbacks[event] = callback;
};

LastBrickCrackingHandler.prototype.remainingSeconds = function () {
  return this.timer.remainingSeconds();
};

LastBrickCrackingHandler.prototype.draw = function (ctx) {
  if (this.timer.remainingSeconds() < 1) {
    // draw thunder for last 1 seconds
  }
};
