class Bat {
  constructor(windowWidth, windowHeight, canvas) {
    this.widthPercentageOfWindow = 14;
    this.maxPercentage = 20;
    this.minPercentage = 8;

    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;

    this.margin = 5;

    const rectHeight = 20;

    this.rect = {
      x: this.margin,
      y: 0,
      width: (windowWidth / 100.0) * this.widthPercentageOfWindow,
      height: rectHeight,
    };
    this.canvasRect = {
      x: 0,
      y: this.windowHeight - this.margin - this.rect.height,
      width: windowWidth,
      height: this.margin + this.rect.height,
    };

    this.ctx = canvas.getContext("2d", {
      alpha: false,
    });
    this.ctx.canvas.width = this.canvasRect.width;
    this.ctx.canvas.height = this.canvasRect.height;

    this.ctx.canvas.style.left = `${this.canvasRect.x}px`;
    this.ctx.canvas.style.top = `${this.canvasRect.y}px`;
    this.ctx.canvas.style.position = "absolute";
  }

  windowResized(windowWidth, windowHeight) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;

    this.canvasRect.y = windowHeight - this.margin - this.rect.height;
    this.canvasRect.width = windowWidth;

    this.ctx.canvas.style.top = `${this.canvasRect.y}px`;

    this.rect.width = (windowWidth / 100) * this.widthPercentageOfWindow;
    this.repositionBatInsideWindow();
    this.draw();
  }

  mouseMoved(cursorX) {
    this.rect.x = cursorX - this.rect.width / 2;
    this.repositionBatInsideWindow();
    this.draw();
  }

  repositionBatInsideWindow() {
    // Bat is out of the window - left side
    if (this.rect.x < this.margin) {
      this.rect.x = this.margin;
    }

    // Bat is out of the window - right side
    if (this.rect.x + this.rect.width > this.windowWidth - this.margin) {
      this.rect.x = this.windowWidth - this.rect.width - this.margin;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.fillStyle = "#b89ae4";

    this.ctx.fillRect(
      this.rect.x,
      this.rect.y,
      this.rect.width,
      this.rect.height
    );
  }

  centerTop() {
    const centerX = this.rect.x + this.rect.width / 2;
    const centerY = this.canvasRect.y;

    return {
      x: centerX,
      y: centerY,
    };
  }

  relativeBatRect() {
    const x = this.rect.x;
    const y = this.canvasRect.y;
    const width = this.rect.width;
    const height = this.rect.height;

    return {
      x: x,
      y: y,
      width: width,
      height: height,
    };
  }
}
