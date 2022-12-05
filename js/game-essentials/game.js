class Game {
  constructor(windowWidth, windowHeight, canvas, batCanvas, stageCanvas) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;

    this.ctx = canvas.getContext("2d");
    this.ctx.canvas.width = windowWidth;
    this.ctx.canvas.height = windowHeight;
    this.ctx.canvas.style.left = "0px";
    this.ctx.canvas.style.top = "0px";
    this.ctx.canvas.style.position = "absolute";

    this.state = {
      waiting: "WAITING",
      running: "RUNNING",
      no_more_life: "NO_MORE_LIFE",
      no_more_stages: "NO_MORE_STAGES",
    };
    this.curState = this.state.waiting;

    this.callbacks = {};

    this.lifeCount = 3;

    // bat setup
    this.bat = new Bat(windowWidth, windowHeight, batCanvas);
    this.bat.windowResized(windowWidth, windowHeight);

    // ball setup
    this.balls = [new Ball()];

    // stage setup
    this.initialStageSetup(windowWidth, windowHeight, stageCanvas);
  }

  windowResized(windowWidth, windowHeight) {
    // keep reference
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;

    // canvas update
    this.ctx.canvas.width = windowWidth;
    this.ctx.canvas.height = windowHeight;

    // bat update
    this.bat.windowResized(windowWidth, windowHeight);

    // ball update
    for (const ball of this.balls) {
      ball.windowResized(windowWidth, windowHeight);
    }

    // stage update
    this.stage.windowResized(windowWidth, windowHeight);
  }

  mouseMoved(cursorX) {
    this.bat.mouseMoved(cursorX);
  }

  initialStageSetup(windowWidth, windowHeight, stageCanvas) {
    this.currentStage = 0;
    this.stage = new Stage(
      windowWidth,
      windowHeight,
      stageDatas[this.currentStage],
      stageCanvas
    );

    const self = this;

    this.stage.on("end", () => {
      self.moveToNextStage();
    });

    this.lastBrickCrackingHandler = undefined;
    this.stage.on("last_brick", (lastBrickRect) => {
      self.handleLastBrickRemaining(lastBrickRect);
    });
  }

  startGame() {
    this.curState = this.state.running;

    if (
      !this.lastBrickCrackingHandler &&
      stageDatas.length > this.currentStage &&
      this.lifeCount > 0
    ) {
    }
  }

  operateBall() {
    if (this.curState === this.state.waiting) {
      // Ball will stick to the bat
      const batTopCenter = this.bat.centerTop();
      for (const ball of this.balls) {
        ball.stickBottomToPoint(batTopCenter.x, batTopCenter.y);
      }
    } else {
      // Ball will be moving in each frame
      const extraBallsDroppedToBottom = [];
      for (const ball of this.balls) {
        // window collision
        const bottomCollided =
          ball.handleCollisionWithWindowReportBottomCollision(
            this.windowWidth,
            this.windowHeight
          );
        if (bottomCollided) {
          if (this.balls.length === 1) {
            //last ball
            this.handleLastBallDroppedToBottom();
          } else {
            extraBallsDroppedToBottom.push(ball);
          }
        }

        // bat collision
        const batRect = this.bat.relativeBatRect();
        const ballBatCollided = ball.handleCollisionWithBat(
          batRect.x,
          batRect.width,
          batRect.y
        );

        // stage collision
        const brickCollisionResult =
          this.stage.handleBrickCollisionWithBallAndReportCollision(ball);
        if (brickCollisionResult) {
          this.stage.draw();
        }
        ball.handleBrickCollisionResult(brickCollisionResult);

        // move ball
        ball.move();
      }

      for (const ball of extraBallsDroppedToBottom) {
        const ballIndex = this.balls.indexOf(ball);
        if (ballIndex > -1) {
          this.balls.splice(ballIndex, 1);
        }
      }
    }
  }

  moveToNextStage() {
    if (this.lastBrickCrackingHandler) {
      this.lastBrickCrackingHandler.handleStagePassed();
      this.lastBrickCrackingHandler = undefined;
    }

    if (this.currentStage < stageDatas.length - 1) {
      this.currentStage++;
      this.curState = this.state.waiting;
      this.stage.setNewStageData(stageDatas[this.currentStage]);
      this.stage.draw();
    } else {
      this.curState = this.state.no_more_stages;
      if (this.callbacks["all_stage_finished"]) {
        this.callbacks["all_stage_finished"](this.stage.score);
      }
      this.stage.clearDrawing();
    }
  }

  handleLastBrickRemaining(lastBrickRect) {
    if (
      !this.lastBrickCrackingHandler &&
      this.curState === this.state.running
    ) {
      console.log("handle last brick remaining called");
      this.lastBrickCrackingHandler = new LastBrickCrackingHandler(
        30,
        lastBrickRect
      );
      const self = this;
      this.lastBrickCrackingHandler.on("end", () => {
        self.lastBrickCrackingHandler = undefined;
        self.moveToNextStage();
      });
    }
  }

  handleLastBallDroppedToBottom() {
    this.curState = this.state.waiting;
    this.lifeCount--;

    // Reset ball angles
    for (const ball of this.balls) {
      ball.initialAngleSpeedSetup();
    }

    if (this.lifeCount === 0) {
      this.curState = this.state.no_more_life;
      if (this.callbacks["no_more_life"]) {
        this.callbacks["no_more_life"](this.stage.score);
        this.stage.clearDrawing();
      }
      if (this.lastBrickCrackingHandler) {
        this.lastBrickCrackingHandler.handleStagePassed();
        this.lastBrickCrackingHandler = undefined;
      }
    }
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.windowWidth, this.windowHeight);

    if (
      this.curState === this.state.no_more_stages ||
      this.curState === this.state.no_more_life
    ) {
      this.drawGameOver();
      this.drawScore();
      this.drawStageName();
    } else {
      this.drawLife();
      this.drawScore();
      this.drawStageName();

      // Ball movement, collision reporting and handling
      this.operateBall();

      // ball drawing
      for (const ball of this.balls) {
        ball.draw(this.ctx);
      }

      // last brick remaining time
      this.drawLastBrickRemainingTime();
    }
  }

  drawLife() {
    const heartImage = document.getElementById("heart_image");

    const margin = 10;
    const width = 40;
    const height = 40;

    let curX = this.windowWidth - margin - width;

    for (let i = 0; i < this.lifeCount; i++) {
      this.ctx.drawImage(heartImage, curX, margin, width, height);
      curX -= margin + width;
    }
  }

  drawScore() {
    const margin = 10;

    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "30px Comic Sans MS";
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score : ${this.stage.score}`, margin, margin);
  }

  drawStageName() {
    const margin = 10;

    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "30px Comic Sans MS";
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "center";

    this.ctx.fillText(
      stageDatas[this.currentStage].name,
      this.windowWidth / 2,
      margin
    );
  }

  drawGameOver() {
    const gameOverImage = document.getElementById("game_over_image");

    const imageX = (this.windowWidth - gameOverImage.width) / 2;

    this.ctx.drawImage(gameOverImage, imageX, 50);
  }

  drawLastBrickRemainingTime() {
    if (this.lastBrickCrackingHandler) {
      this.ctx.fillStyle = "#FF0000";
      this.ctx.font = "40px Comic Sans MS";
      this.ctx.textBaseline = "center";
      this.ctx.textAlign = "center";

      this.ctx.fillText(
        `${this.lastBrickCrackingHandler.remainingSeconds()}`,
        this.windowWidth / 2,
        this.windowHeight / 2
      );
    }
  }

  decreaseLife() {
    this.handleLastBallDroppedToBottom();
  }
}
