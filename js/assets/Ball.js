class Ball {
  constructor(speed) {
    this.radius = 13;

    this.centerX = this.radius;
    this.centerY = this.radius;
    this.speed = speed;

    this.setInitialAngle();
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = "blue";
    ctx.fill();
  }

  setInitialAngle() {
    this.angle = Math.PI / 4;
    this.speedX = Math.cos(this.angle) * this.speed;
    this.speedY = -Math.sin(this.angle) * this.speed;
  }

  moveBall() {
    this.centerX += this.speedX;
    this.centerY += this.speedY;
  }

  invertHorizontalSpeed() {
    this.speedX *= -1;
  }

  invertVerticalSpeed() {
    this.speedY *= -1;
  }

  predictedNextCenter() {
    return {
      centerX: this.centerX + this.speedX,
      centerY: this.centerY + this.speedY,
    };
  }

  updateScreenSize(width, height) {
    this.centerX = Math.max(
      this.radius,
      Math.min(width - this.radius, this.centerX)
    );
    this.centerY = Math.max(
      this.radius,
      Math.min(height - this.radius, this.centerY)
    );
  }

  handleWindowCollision(width, height) {
    const nextBallPosition = this.predictedNextCenter();

    if (
      nextBallPosition.centerX - this.radius < 0 ||
      nextBallPosition.centerX + this.radius > width
    ) {
      this.invertHorizontalSpeed();
    }

    if (nextBallPosition.centerY - this.radius < 0) {
      this.invertVerticalSpeed();
    } else if (nextBallPosition.centerY + this.radius > height) {
      return true;
    }
    return false;
  }

  handleBrickCollision(brickCollision) {
    if (!brickCollision) return;

    switch (brickCollision) {
      case "top":
      case "bottom":
        this.invertVerticalSpeed();
        break;
      case "left":
      case "right":
        this.invertHorizontalSpeed();
        break;
    }
  }

  getHitDirectionWithBrick(brick) {
    const nextCenter = this.predictedNextCenter();

    const ballLeftX = nextCenter.centerX - this.radius;
    const ballRightX = nextCenter.centerX + this.radius;
    const ballTopY = nextCenter.centerY - this.radius;
    const ballBottomY = nextCenter.centerY + this.radius;

    const brickLeftX = brick.x;
    const brickRightX = brick.x + brick.width;
    const brickTopY = brick.y;
    const brickBottomY = brick.y + brick.height;

    if (
      ballBottomY >= brickTopY &&
      ballTopY <= brickBottomY &&
      ballLeftX <= brickRightX &&
      ballRightX >= brickLeftX
    ) {
      return this.speedY > 0 ? "top" : "bottom";
    }

    if (
      ballRightX >= brickLeftX &&
      ballLeftX <= brickRightX &&
      nextCenter.centerY >= brickTopY &&
      nextCenter.centerY <= brickBottomY
    ) {
      return this.speedY > 0 ? "left" : "right";
    }

    return undefined;
  }

  degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  alignBottomWithPoint(posX, posY) {
    this.centerX = posX;
    this.centerY = posY - this.radius;
  }

  handleBoardCollision(boardX, boardWidth, boardTopY) {
    const nextBallPosition = this.predictedNextCenter();
    const ballBottomY = nextBallPosition.centerY + this.radius;
    if (
      ballBottomY > boardTopY &&
      boardX < nextBallPosition.centerX &&
      nextBallPosition.centerX < boardX + boardWidth
    ) {
      const angleDeviation = this.degreesToRadians(120);
      const collisionDeviation = boardX + boardWidth - nextBallPosition.centerX;

      this.angle =
        (collisionDeviation / boardWidth) * angleDeviation +
        this.degreesToRadians(30);

      if (
        this.angle > this.degreesToRadians(75) &&
        this.angle < this.degreesToRadians(105)
      ) {
        this.angle =
          this.angle > this.degreesToRadians(90)
            ? this.degreesToRadians(105)
            : this.degreesToRadians(75);
      }

      this.speedX = Math.cos(this.angle) * this.speed;
      this.speedY = Math.sin(this.angle) * this.speed;
      this.invertVerticalSpeed();
      return true;
    }
  }
}
