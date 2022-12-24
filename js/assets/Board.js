class Board {
  constructor(screenWidth, screenHeight, canvas) {
    this.margin = 20;
    this.rectangle = {
      x: this.margin,
      y: 0,
      width: (screenWidth / 100) * 14,
      height: 30,
    };
    this.canvasRect = {
      x: 0,
      y: screenHeight - this.margin - this.rectangle.height,
      width: screenWidth,
      height: this.margin + this.rectangle.height,
    };

    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.ctx = canvas.getContext("2d", { alpha: false });
    this.ctx.canvas.width = this.canvasRect.width;
    this.ctx.canvas.height = this.canvasRect.height;
    this.ctx.canvas.style.position = "absolute";
    this.ctx.canvas.style.left = `${this.canvasRect.x}px`;
    this.ctx.canvas.style.top = `${this.canvasRect.y}px`;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(
      this.rectangle.x,
      this.rectangle.y,
      this.rectangle.width,
      this.rectangle.height
    );
  }

  getTopCenter() {
    const centerX = this.rectangle.x + this.rectangle.width / 2;
    const centerY = this.canvasRect.y;

    return {
      x: centerX,
      y: centerY,
    };
  }

  getRelativeBoardRect() {
    const x = this.rectangle.x;
    const y = this.canvasRect.y;
    const width = this.rectangle.width;
    const height = this.rectangle.height;

    return {
      x: x,
      y: y,
      width: width,
      height: height,
    };
  }

  updateScreenSize(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.rectangle.width = (screenWidth / 100) * 14;
    this.canvasRect.y = screenHeight - this.margin - this.rectangle.height;
    this.canvasRect.width = screenWidth;
    this.ctx.canvas.width = screenWidth;
    this.ctx.canvas.height = screenHeight;
    this.ctx.canvas.style.top = `${this.canvasRect.y}px`;
    this.changeBoardPosition();
    this.draw();
  }

  mouseMoved(cursorX) {
    this.rectangle.x = cursorX - this.rectangle.width / 2;
    this.changeBoardPosition();
    this.draw();
  }

  changeBoardPosition() {
    if (this.rectangle.x < this.margin) {
      this.rectangle.x = 0;
    }

    if (this.rectangle.x + this.rectangle.width > this.screenWidth) {
      this.rectangle.x = this.screenWidth - this.rectangle.width;
    }
  }
}
