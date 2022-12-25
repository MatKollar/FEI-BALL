class Board {
  constructor(screenWidth, screenHeight, canvas) {
    this.margin = 20;
    this.rectangle = {
      x: screenWidth / 2 - ((screenWidth / 100) * 14) / 2,
      y: 0,
      width: (screenWidth / 100) * 14,
      height: 30,
    };
    this.canvasRect = {
      x: 0,
      y: screenHeight - this.margin - this.rectangle.height,
      width: screenWidth,
      height: screenHeight,
    };

    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.ctx = canvas.getContext("2d", { alpha: false });
    this.ctx.canvas.width = this.canvasRect.width;
    this.ctx.canvas.height = this.canvasRect.height;
    this.ctx.canvas.style.position = "absolute";
    this.ctx.canvas.style.left = `${this.canvasRect.x}px`;
    this.ctx.canvas.style.top = `${this.canvasRect.y}px`;

    this.ctx = canvas.getContext("2d", { alpha: false });
    canvas.addEventListener("mousedown", this.dragStart.bind(this));
    canvas.addEventListener("mouseup", this.dragEnd.bind(this));
    canvas.addEventListener("mousemove", this.drag.bind(this));
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

  dragStart(e) {
    this.isDragging = true;
    this.initialX = e.clientX - this.rectangle.x;
    this.initialY = e.clientY - this.canvasRect.y;
  }

  dragEnd(e) {
    this.isDragging = false;
  }

  drag(e) {
    if (this.isDragging) {
      e.preventDefault();
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.rectangle.x = x - this.initialX;
      this.changeBoardPosition();
      this.draw();
    }
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
    this.rectangle.x = screenWidth / 2 - ((screenWidth / 100) * 14) / 2;
    this.changeBoardPosition();
    this.draw();
  }

  changeBoardPosition() {
    console.log(this.rectangle.x);
    if (this.rectangle.x < this.margin) {
      this.rectangle.x = 0;
    }

    if (this.rectangle.x + this.rectangle.width > this.screenWidth) {
      this.rectangle.x = this.screenWidth - this.rectangle.width;
    }
  }
}
