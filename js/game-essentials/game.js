class Game {
  constructor(screenWidth, screenHeight, canvas, boardCanvas, stageCanvas) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.state = {
      waiting: "WAITING",
      running: "RUNNING",
      no_more_life: "NO_MORE_LIFE",
      no_more_stages: "NO_MORE_STAGES",
    };
    this.curState = this.state.waiting;

    this.callbacks = {};

    this.lifeCount = 3;

    this.board = new Board(screenWidth, screenHeight, boardCanvas);
    this.board.updateScreenSize(screenWidth, screenHeight);

    this.ball = new Ball();

    this.ctx = canvas.getContext("2d");
    this.ctx.canvas.width = screenWidth;
    this.ctx.canvas.height = screenHeight;
    this.ctx.canvas.style.left = "0px";
    this.ctx.canvas.style.top = "0px";
    this.ctx.canvas.style.position = "absolute";

    this.initialStageSetup(screenWidth, screenHeight, stageCanvas);
  }

  windowResized(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.ctx.canvas.width = screenWidth;
    this.ctx.canvas.height = screenHeight;

    this.board.updateScreenSize(screenWidth, screenHeight);
    this.ball.updateScreenSize(screenWidth, screenHeight);
    this.stage.updateScreenSize(screenWidth, screenHeight);
  }

  mouseMoved(cursorX) {
    this.board.mouseMoved(cursorX);
  }

  initialStageSetup(screenWidth, screenHeight, stageCanvas) {
    this.currentStage = 0;
    this.stage = new Stage(
      screenWidth,
      screenHeight,
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
      // Ball will stick to the board
      const batTopCenter = this.board.getTopCenter();
      this.ball.alignBottomWithPoint(batTopCenter.x, batTopCenter.y);
    } else {
      // Ball will be moving in each frame
      const extraBallsDroppedToBottom = [];
      // window collision
      const bottomCollided = this.ball.handleWindowCollision(
        this.screenWidth,
        this.screenHeight
      );
      if (bottomCollided) {
        this.handleLastBallDroppedToBottom();
      }

      // board collision
      const batRect = this.board.getRelativeBoardRect();
      this.ball.handleBoardCollision(batRect.x, batRect.width, batRect.y);

      // stage collision
      const brickCollisionResult =
        this.stage.detectAndHandleBrickCollisionWithBall(this.ball);
      if (brickCollisionResult) {
        this.stage.draw();
      }
      this.ball.handleBrickCollision(brickCollisionResult);

      this.ball.moveBall();
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

    this.ball.setInitialSpeedAndAngle();

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
    this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);

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

      this.ball.draw(this.ctx);

      // last brick remaining time
      this.drawLastBrickRemainingTime();
    }
  }

  drawLife() {
    const heartImage = document.getElementById("heart_image");

    const margin = 10;
    const width = 40;
    const height = 40;

    let curX = this.screenWidth - margin - width;

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
      this.screenWidth / 2,
      margin
    );
  }

  drawGameOver() {
    const gameOverImage = document.getElementById("game_over_image");

    const imageX = (this.screenWidth - gameOverImage.width) / 2;

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
        this.screenWidth / 2,
        this.screenHeight / 2
      );
    }
  }

  decreaseLife() {
    this.handleLastBallDroppedToBottom();
  }
}
