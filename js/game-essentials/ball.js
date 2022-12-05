class Ball {
  constructor(centerX, centerY, speed, radius) {
    this.radius = radius || 14;
    this.minRadius = 9;
    this.maxRadius = 20;

    this.centerX = centerX || this.radius;
    this.centerY = centerY || this.radius;

    this.initialAngleSpeedSetup(speed);

    this.maxSpeed = 18;
    this.minSpeed = 6;
  }

  increaseSpeed() {
    if (this.speed < this.maxSpeed) {
      this.speed += 2;
      this.adjustNewSpeed();
    }
  }

  decreaseSpeed() {
    if (this.speed > this.minSpeed) {
      this.speed -= 2;
      this.adjustNewSpeed();
    }
  }

  initialAngleSpeedSetup(speed = 10) {
    this.speed = speed;
    this.angle = Math.PI / 4;
    this.speedX = Math.cos(this.angle) * this.speed;
    this.speedY = -Math.sin(this.angle) * this.speed;
  }

  adjustNewSpeed() {
    let previousX = this.speedX;
    let previousY = this.speedY;

    this.speedX = Math.cos(this.angle) * this.speed;
    this.speedY = Math.sin(this.angle) * this.speed;

    // signs needed to be matched
    if (previousX * this.speedX < 0) {
      // their signs are opposite
      this.speedX *= -1;
    }

    if (previousY * this.speedY < 0) {
      // their signs are opposite
      this.speedY *= -1;
    }
  }

  move() {
    this.centerX += this.speedX;
    this.centerY += this.speedY;
  }

  flipSpeedVertically() {
    this.speedY *= -1;
  }

  flipSpeedHorizontally() {
    this.speedX *= -1;
  }

  centerAfterNextMove() {
    return {
      centerX: this.centerX + this.speedX,
      centerY: this.centerY + this.speedY,
    };
  }

  stickBottomToPoint(posX, posY) {
    this.centerX = posX;
    this.centerY = posY - this.radius;
  }

  handleCollisionWithWindowReportBottomCollision(wWidth, wHeight) {
    let nextCenter = this.centerAfterNextMove();

    if (
      nextCenter.centerX - this.radius < 0 ||
      nextCenter.centerX + this.radius > wWidth
    ) {
      this.flipSpeedHorizontally();
    }

    if (nextCenter.centerY - this.radius < 0) {
      this.flipSpeedVertically();
    } else if (nextCenter.centerY + this.radius > wHeight) {
      return true;
    }
    return false;
  }

  handleBrickCollisionResult(brickCollisionResult) {
    if (!brickCollisionResult) return;

    switch (brickCollisionResult) {
      case "top":
      case "bottom":
        this.flipSpeedVertically();
        break;
      case "left":
      case "right":
        this.flipSpeedHorizontally();
        break;
    }
  }

  handleCollisionWithBat(batX, batWidth, batTopY) {
    let nextCenter = this.centerAfterNextMove();
    let ballBottomY = nextCenter.centerY + this.radius;
    if (
      ballBottomY > batTopY &&
      batX < nextCenter.centerX &&
      nextCenter.centerX < batX + batWidth
    ) {
      let batRightMostRadian = 0.523599; // 30 Degree
      let batLeftMostRadian = 2.61799; // 150 Degree
      let nintyDegreeInRadian = Math.PI / 2;
      let seventySixDegreeInRadian = 1.32645; // 76 Degree
      let hundredAndFourDegreeInRadian = 1.81514; // 104 Degree

      let angleDeviation = batLeftMostRadian - batRightMostRadian;
      let collisionDeviation = batX + batWidth - nextCenter.centerX;

      // Simple interpolation
      this.angle =
        batRightMostRadian + (collisionDeviation / batWidth) * angleDeviation;

      // Omitting straight 90 Degree movement
      if (
        this.angle > seventySixDegreeInRadian &&
        this.angle < hundredAndFourDegreeInRadian
      ) {
        this.angle =
          this.angle > nintyDegreeInRadian
            ? hundredAndFourDegreeInRadian
            : seventySixDegreeInRadian;
      }

      this.speedX = Math.cos(this.angle) * this.speed;
      this.speedY = Math.sin(this.angle) * this.speed;

      this.flipSpeedVertically();
      return true;
    }
  }

  windowResized(wWidth, wHeight, radius) {
    this.centerX = Math.clamp(this.centerX, radius, wWidth - radius);
    this.centerY = Math.clamp(this.centerY, radius, wHeight - radius);
  }

  draw(ctx) {
    ctx.fillStyle = "#FFA500";
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  calculateHitDirectionWithRect(rect) {
    const nextCenter = this.centerAfterNextMove();

    const ballLeftX = nextCenter.centerX - this.radius;
    const ballRightX = nextCenter.centerX + this.radius;
    const ballTopY = nextCenter.centerY - this.radius;
    const ballBottomY = nextCenter.centerY + this.radius;

    const rectLeftX = rect.x;
    const rectRightX = rect.x + rect.width;
    const rectTopY = rect.y;
    const rectBottomY = rect.y + rect.height;

    if (
      ballBottomY >= rectTopY &&
      ballTopY <= rectBottomY &&
      nextCenter.centerX >= rectLeftX &&
      nextCenter.centerX <= rectRightX
    ) {
      switch (true) {
        case this.speedY > 0:
          return "top";
        case this.speedY < 0:
          return "bottom";
      }
    }

    if (
      ballRightX >= rectLeftX &&
      ballLeftX <= rectRightX &&
      nextCenter.centerY >= rectTopY &&
      nextCenter.centerY <= rectBottomY
    ) {
      switch (true) {
        case this.speedX > 0:
          return "left";
        case this.speedX < 0:
          return "right";
      }
    }

    return undefined;
  }
}
