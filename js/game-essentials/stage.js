class Stage {
  constructor(windowWidth, windowHeight, stageData, canvas) {
    this.margin = {
      top: 100,
      left: 10,
      right: 10,
      bottom: 0,
    };

    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    this.stageData = stageData;
    this.callbacks = {};

    this.score = 0;

    this.ctx = canvas.getContext("2d", {
      alpha: false,
    });
    this.ctx.canvas.width = windowWidth;
    this.ctx.canvas.height = windowHeight;
    this.ctx.canvas.style.left = "0px";
    this.ctx.canvas.style.top = "0px";
    this.ctx.canvas.style.position = "absolute";

    this.draw();
  }

  windowResized(windowWidth, windowHeight) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;

    this.ctx.canvas.width = windowWidth;
    this.ctx.canvas.height = windowHeight;

    this.draw();
  }

  draw() {
    this.clearDrawing();
    let brickCount = 0;
    let brickRect = undefined;

    this.traverseBricks((brickValue, x, y, width, height) => {
      if (brickValue > 0) {
        brickCount++;
        brickRect = { x, y, width, height };
        this.ctx.fillStyle = this.stageData.colorByType[brickValue];
        this.ctx.fillRect(x, y, width, height);
      }
    });

    if (brickCount == 0 && this.callbacks["end"]) {
      this.callbacks["end"]();
    } else if (brickCount == 1 && this.callbacks["last_brick"]) {
      this.callbacks["last_brick"](brickRect);
    }
  }

  clearDrawing() {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  // It will return next ball hit direction
  // "top", "bottom", "left", "right"
  handleBrickCollisionWithBallAndReportCollision(ball) {
    // ball is within stage rectangle, now check for each brick to have collision with ball or not
    let self = this;
    let collideResult = undefined;
    this.traverseBricks(function (brickValue, x, y, width, height, row, col) {
      if (brickValue > 0) {
        const collide = ball.getHitDirectionWithBrick({
          x: x,
          y: y,
          width: width,
          height: height,
        });
        if (collide) {
          // decrease brick value by one
          self.score++;
          self.stageData.data[row][col] = brickValue - 1;
          collideResult = collide;
          return true;
        }
      }
    });
    return collideResult;
  }

  traverseBricks(iterationCallback) {
    // Calculate the dimensions of the bricks
    const availableWidth =
      this.windowWidth - this.margin.left - this.margin.right;
    const brickWidth =
      availableWidth / this.stageData.col - this.stageData.gap.horizontal;

    // Loop through each row and column of bricks
    for (const [row, bricks] of this.stageData.data.entries()) {
      let curY =
        this.margin.top +
        row * (this.stageData.brickHeight + this.stageData.gap.vertical);

      for (const [col, brickValue] of bricks.entries()) {
        let curX =
          this.margin.left + col * (brickWidth + this.stageData.gap.horizontal);

        // Call the iteration callback function with the current brick's value, position, and dimensions
        const stopIterating = iterationCallback(
          brickValue,
          curX,
          curY,
          brickWidth,
          this.stageData.brickHeight,
          row,
          col
        );

        if (stopIterating) {
          return;
        }
      }
    }
  }

  setNewStageData(stageData) {
    this.stageData = stageData;
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }
}