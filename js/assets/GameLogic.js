class GameLogic {
  constructor(
    screenWidth,
    screenHeight,
    canvas,
    boardCanvas,
    stageCanvas,
    stageData,
    difficulty
  ) {
    this.lifeCount = 3;
    this.difficulty = difficulty;
    this.stageData = stageData;
    this.ball;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.board = new Board(screenWidth, screenHeight, boardCanvas);
    canvas.addEventListener("mousedown", this.board.dragStart.bind(this.board));
    canvas.addEventListener("mouseup", this.board.dragEnd.bind(this.board));
    canvas.addEventListener("mousemove", this.board.drag.bind(this.board));
    this.board.updateScreenSize(screenWidth, screenHeight);
    this.callbacks = {};
    this.passedLevels = [];

    this.state = {
      waiting: "WAITING",
      running: "RUNNING",
      paused: "PAUSED",
      gameover: "GAMEOVER",
      victory: "VICTORY",
    };
    this.curState = this.state.waiting;
    this.prevState = this.state.waiting;

    this.ctx = canvas.getContext("2d");
    this.ctx.canvas.width = screenWidth;
    this.ctx.canvas.height = screenHeight;
    this.ctx.canvas.style.left = "0px";
    this.ctx.canvas.style.top = "0px";
    this.ctx.canvas.style.position = "absolute";

    this.initializeStage(screenWidth, screenHeight, stageCanvas);
    this.isMobile = "DeviceOrientationEvent" in window;
    if (this.isMobile) {
      window.addEventListener(
        "deviceorientation",
        this.handleOrientation.bind(this)
      );
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);
    if (!this.isMobile) {
      this.board.draw();
    }

    if (this.timer.remainingSeconds() === 0) {
      this.handleGameOver();
    }

    switch (this.curState) {
      case this.state.victory:
        this.drawVictory();
        this.drawLevelName();
        this.drawScore();
        break;
      case this.state.gameover:
        this.drawGameOver();
        this.drawLevelName();
        this.drawScore();
        break;
      case this.state.paused:
        this.drawBall();
        this.drawLevelName();
        this.drawScore();
        this.drawLifesRemaining();
        this.pauseTimer();
        this.drawTime();
        break;
      default:
        this.resumeTimer();
        this.drawLevelName();
        this.drawBall();
        this.updateBallState();
        this.drawLifesRemaining();
        this.drawScore();
        this.drawTime();
        break;
    }
  }

  drawBall() {
    this.ball.draw(this.ctx);
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
    const { currentLevel, screenWidth, ctx } = this;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.font = "bold 35px Roboto";
    ctx.fillText(this.stageData[currentLevel].name, screenWidth / 2, margin);
  }

  drawVictory() {
    const gameOverImage = document.getElementById("victory");
    const x = (this.screenWidth - gameOverImage.width) / 2;
    this.ctx.drawImage(gameOverImage, x, 10);
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

  handleOrientation(e) {
    const maxAngle = 90;
    const angle = Math.min(Math.max(e.gamma, -maxAngle), maxAngle);
    const percent = angle / maxAngle;
    this.board.rectangle.x =
      this.screenWidth / 2 -
      this.board.rectangle.width / 2 +
      percent * (this.screenWidth - this.board.rectangle.width);
    this.board.draw();
  }

  initializeStage(screenWidth, screenHeight, stageCanvas) {
    this.currentLevel = this.pickLevel();
    this.stage = new Stage(
      screenWidth,
      screenHeight,
      this.stageData[this.currentLevel],
      stageCanvas
    );

    this.ball = new Ball(this.stageData[this.currentLevel].speed);
    this.timer = new Timer(this.stageData[this.currentLevel].time);

    this.availableLevels = this.countLevels();

    this.stage.on("end", () => {
      this.proceedToNextLevel();
    });
  }

  countLevels() {
    let count = 0;

    for (let i = 0; i < this.stageData.length; i++) {
      if (this.stageData[i].difficulty === this.difficulty) {
        count++;
      }
    }

    return count;
  }

  pickLevel() {
    let level;
    do {
      level = this.getRandomNumber(0, this.stageData.length - 1);
    } while (
      this.stageData[level].difficulty !== this.difficulty ||
      this.passedLevels.includes(this.stageData[level].name)
    );

    return level;
  }

  getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  startGame() {
    this.switchState(this.state.running);
  }

  pauseGame() {
    if (this.curState === this.state.paused) {
      this.switchState(this.prevState);
    } else {
      this.prevState = this.curState;
      this.switchState(this.state.paused);
    }
  }

  pauseTimer() {
    this.timer.pause();
  }

  resumeTimer() {
    this.timer.resume();
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

  switchState(newState) {
    this.prevState = this.curState;
    this.curState = newState;
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
      this.switchState(this.state.waiting);
    }
  }

  proceedToNextLevel() {
    this.passedLevels.push(this.stageData[this.currentLevel].name);

    window.localStorage.setItem(
      "passed_levels",
      JSON.stringify(this.passedLevels)
    );

    if (this.passedLevels.length - 1 < this.availableLevels - 1) {
      this.passedLevels = JSON.parse(
        window.localStorage.getItem("passed_levels")
      );

      this.currentLevel = this.pickLevel();
      this.switchState(this.state.waiting);
      this.stage.setNewStageData(this.stageData[this.currentLevel]);
      this.timer = new Timer(this.stageData[this.currentLevel].time);
      this.stage.draw();
    } else {
      this.handleVictory();
    }
  }

  handleVictory() {
    this.switchState(this.state.victory);
    if (this.callbacks["victory"]) {
      this.callbacks["victory"](this.stage.score);
    }
    this.stage.clearDrawing();
    window.localStorage.clear();
  }

  handleGameOver() {
    this.switchState(this.state.gameover);
    if (this.callbacks["gameover"]) {
      this.callbacks["gameover"](this.stage.score);
      this.stage.clearDrawing();
      window.localStorage.clear();
    }
  }
}
