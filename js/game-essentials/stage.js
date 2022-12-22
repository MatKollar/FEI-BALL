class Stage {
  constructor(screenWidth, screenHeight, stageData, canvas) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.score = 0;
    this.stageData = stageData;
    this.callbacks = {};

    this.margin = {
      top: 50,
      left: 50,
      right: 50,
      bottom: 0,
    };

    this.ctx = canvas.getContext("2d", {
      alpha: false,
    });
    this.ctx.canvas.width = screenWidth;
    this.ctx.canvas.height = screenHeight;
    this.ctx.canvas.style.position = "absolute";
    this.ctx.canvas.style.left = "0px";
    this.ctx.canvas.style.top = "0px";

    this.draw();
  }

  draw() {
    this.clearDrawing();
    let brickCount = 0;
    let brickRect = undefined;

    this.iterateBricks((brickValue, x, y, width, height) => {
      if (brickValue > 0) {
        brickCount++;
        brickRect = { x, y, width, height };
        this.ctx.fillStyle = this.stageData.colorByType[brickValue];
        this.ctx.fillRect(x, y, width, height);
      }
    });

    if (brickCount === 0 && this.callbacks["end"]) {
      this.callbacks["end"]();
    } else if (brickCount === 1 && this.callbacks["last_brick"]) {
      this.callbacks["last_brick"](brickRect);
    }
  }

  setNewStageData(stageData) {
    this.stageData = stageData;
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  updateScreenSize(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.ctx.canvas.width = screenWidth;
    this.ctx.canvas.height = screenHeight;
    this.draw();
  }

  clearDrawing() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  iterateBricks(iterationCallback) {
    const { screenWidth, margin, stageData } = this;
    const availableWidth = screenWidth - margin.left - margin.right;
    const brickWidth =
      availableWidth / stageData.col - stageData.gap.horizontal;

    stageData.data.forEach((bricks, row) => {
      let y =
        margin.top + row * (stageData.brickHeight + stageData.gap.vertical);

      bricks.forEach((brickValue, col) => {
        let x = margin.left + col * (brickWidth + stageData.gap.horizontal);
        if (
          iterationCallback(
            brickValue,
            x,
            y,
            brickWidth,
            stageData.brickHeight,
            row,
            col
          )
        ) {
          return;
        }
      });
    });
  }

  detectAndHandleBrickCollisionWithBall(ball) {
    let collideResult;
    this.iterateBricks((brickValue, x, y, width, height, row, col) => {
      if (brickValue > 0) {
        const collide = ball.getHitDirectionWithBrick({ x, y, width, height });
        if (collide) {
          this.score++;
          this.stageData.data[row][col] = brickValue - 1;
          collideResult = collide;
          return true;
        }
      }
    });
    return collideResult;
  }
}
