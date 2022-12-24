class Timer {
  constructor(timeout) {
    this.timeout = timeout;
    this.counter = 0;
    this.timerId = setInterval(() => this.handler(), 1000);
  }

  remainingSeconds() {
    return this.timeout - this.counter;
  }

  handler() {
    if (this.counter == this.timeout) {
      clearInterval(this.timerId);
    } else {
      this.counter++;
    }
  }
}
