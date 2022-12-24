class GameLogic {
  constructor(
    screenWidth,
    screenHeight,
    canvas,
    boardCanvas,
    stageCanvas,
    stageDatas
  ) {
    this.lifeCount = 3;
    this.ball = new Ball();
    this.stageDatas = stageDatas;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.board = new Board(screenWidth, screenHeight, boardCanvas);
    this.board.updateScreenSize(screenWidth, screenHeight);
    this.callbacks = {};

    this.state = {
      waiting: "WAITING",
      running: "RUNNING",
      gameover: "GAMEOVER",
      no_more_stages: "NO_MORE_STAGES",
    };
    this.curState = this.state.waiting;

    this.ctx = canvas.getContext("2d");
    this.ctx.canvas.width = screenWidth;
    this.ctx.canvas.height = screenHeight;
    this.ctx.canvas.style.left = "0px";
    this.ctx.canvas.style.top = "0px";
    this.ctx.canvas.style.position = "absolute";

    this.initializeStage(screenWidth, screenHeight, stageCanvas);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);

    if (this.timer.remainingSeconds() === 0) {
      this.handleGameOver();
    }

    if (
      this.curState === this.state.no_more_stages ||
      this.curState === this.state.gameover
    ) {
      this.drawGameOver();
      this.drawLevelName();
      this.drawScore();
    } else {
      this.drawLevelName();
      this.ball.draw(this.ctx);
      this.updateBallState();
      this.drawLifesRemaining();
      this.drawScore();
      this.drawTime();
    }
  }

  drawLifesRemaining() {
    const heartImage = document.getElementById("life");
    const { screenWidth, ctx } = this;
    const width = 50;
    const height = 50;
    const margin = 20;
    let x = screenWidth - margin - width;

    for (let i = 0; i < this.lifeCount; i++) {
      ctx.drawImage(heartImage, x, margin, width, height);
      x -= margin + width;
    }
  }

  drawScore() {
    const margin = 20;
    const { stage, ctx } = this;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    ctx.font = "bold 30px Roboto";
    ctx.fillText(`Score : ${stage.score}`, margin, margin);
  }

  drawLevelName() {
    const margin = 20;
    const { currentStage, screenWidth, ctx } = this;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.font = "bold 35px Roboto";
    ctx.fillText(this.stageDatas[currentStage].name, screenWidth / 2, margin);
  }

  drawGameOver() {
    const gameOverImage = document.getElementById("gameover");
    const x = (this.screenWidth - gameOverImage.width) / 2;
    this.ctx.drawImage(gameOverImage, x, 100);
  }

  drawTime() {
    const { timer, ctx, screenWidth } = this;
    if (timer) {
      ctx.fillStyle = "black";
      ctx.font = "Bold 37px Roboto";
      ctx.textBaseline = "center";
      ctx.textAlign = "center";

      ctx.fillText(`${timer.remainingSeconds()}`, screenWidth / 2, 65);
    }
  }

  startGame() {
    this.curState = this.state.running;
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  updateScreenSize(screenWidth, screenHeight) {
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

  initializeStage(screenWidth, screenHeight, stageCanvas) {
    this.currentStage = 0;
    this.stage = new Stage(
      screenWidth,
      screenHeight,
      this.stageDatas[this.currentStage],
      stageCanvas
    );

    this.timer = new Timer(this.stageDatas[this.currentStage].time);

    this.stage.on("end", () => {
      this.proceedToNextLevel();
    });
  }

  updateBallState() {
    if (this.curState === this.state.waiting) {
      const { x, y } = this.board.getTopCenter();
      this.ball.alignBottomWithPoint(x, y);
    } else {
      const { screenWidth, screenHeight, board, stage } = this;
      const bottomCollided = this.ball.handleWindowCollision(
        screenWidth,
        screenHeight
      );

      if (bottomCollided) {
        this.processLastBallDrop();
      }

      const { x, width, y } = board.getRelativeBoardRect();
      this.ball.handleBoardCollision(x, width, y);

      const brickCollisionResult = stage.detectAndHandleBrickCollisionWithBall(
        this.ball
      );
      if (brickCollisionResult) {
        stage.draw();
      }
      this.ball.handleBrickCollision(brickCollisionResult);

      this.ball.moveBall();
    }
  }

  processLastBallDrop() {
    this.lifeCount--;
    if (this.lifeCount === 0) {
      this.handleGameOver();
    } else {
      this.curState = this.state.waiting;
      this.ball.setInitialSpeedAndAngle();
    }
  }

  proceedToNextLevel() {
    if (this.currentStage < this.stageDatas.length - 1) {
      this.currentStage++;
      this.curState = this.state.waiting;
      this.stage.setNewStageData(this.stageDatas[this.currentStage]);
      this.timer = new Timer(this.stageDatas[this.currentStage].time);
      this.stage.draw();
    } else {
      this.curState = this.state.no_more_stages;
      if (this.callbacks["all_stage_finished"]) {
        this.callbacks["all_stage_finished"](this.stage.score);
      }
      this.stage.clearDrawing();
    }
  }

  handleGameOver() {
    this.curState = this.state.gameover;
    if (this.callbacks["gameover"]) {
      this.callbacks["gameover"](this.stage.score);
      this.stage.clearDrawing();
    }
  }
}
