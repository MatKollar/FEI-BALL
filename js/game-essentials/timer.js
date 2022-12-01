class Timer {
  constructor(expirationInSeconds) {
    this.expirationInSeconds = expirationInSeconds;
    this.counter = 0;
    var self = this;
    this.timerId = setInterval(function () {
      self.handler();
    }, 1000);
    this.callback = {};
  }
  handler() {
    if (this.counter == this.expirationInSeconds) {
      clearInterval(this.timerId);
      if (this.callback["end"]) {
        this.callback["end"]();
      }
    } else {
      this.counter++;
      if (this.callback["update"]) {
        this.callback["update"]();
      }
    }
  }
  passedSeconds() {
    return this.counter;
  }
  remainingSeconds() {
    return this.expirationInSeconds - this.counter;
  }
  on(event, callback) {
    this.callback[event] = callback;
  }
  stop() {
    clearInterval(this.timerId);
  }
}
