class Timer {
  constructor(timeout) {
    this.timeout = timeout;
    this.counter = 0;
    this.isPaused = false;
    this.timerId = setInterval(() => this.handler(), 1000);
  }

  remainingSeconds() {
    return this.timeout - this.counter;
  }

  pause() {
    clearInterval(this.timerId);
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused) {
      this.timerId = setInterval(() => this.handler(), 1000);
      this.isPaused = false;
    }
  }

  handler() {
    if (this.counter == this.timeout) {
      clearInterval(this.timerId);
    } else {
      this.counter++;
    }
  }
}
