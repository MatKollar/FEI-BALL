/* global Bat Ball stageDatas Stage LastBrickCrackingHandler*/

function Game(windowWidth, windowHeight, canvas, batCanvas, stageCanvas) {
	this.windowWidth = windowWidth
	this.windowHeight = windowHeight

	this.ctx = canvas.getContext("2d")
	this.ctx.canvas.width = windowWidth
	this.ctx.canvas.height = windowHeight
	this.ctx.canvas.style.left = "0px"
	this.ctx.canvas.style.top = "0px"
	this.ctx.canvas.style.position = "absolute"


	this.state = {
		waiting: "WAITING",
		running: "RUNNING",
		no_more_life: "NO_MORE_LIFE",
		no_more_stages: "NO_MORE_STAGES"
	}
	this.curState = this.state.waiting

	this.callbacks = {

	}

	this.lifeCount = 2

	// bat setup
	this.bat = new Bat(windowWidth, windowHeight, batCanvas)
	this.bat.windowResized(windowWidth, windowHeight)

	// ball setup
	this.balls = []
	this.balls.push(new Ball())

	// stage setup
	this.initialStageSetup(windowWidth, windowHeight, stageCanvas)
}

Game.prototype.windowResized = function (windowWidth, windowHeight) {

	// keep reference
	this.windowWidth = windowWidth
	this.windowHeight = windowHeight

	// canvas update
	this.ctx.canvas.width = windowWidth
	this.ctx.canvas.height = windowHeight

	// bat update
	this.bat.windowResized(windowWidth, windowHeight)

	// ball update
	for (var index = 0; index < this.balls.length; index++) {
		this.balls[index].windowResized(windowWidth, windowHeight)
	}


	// stage update
	this.stage.windowResized(windowWidth, windowHeight)
}

Game.prototype.mouseMoved = function (cursorX) {
	this.bat.mouseMoved(cursorX)
}

Game.prototype.initialStageSetup = function(windowWidth, windowHeight, stageCanvas) {
	this.currentStage = 0
	this.stage = new Stage(windowWidth, windowHeight, stageDatas[this.currentStage], stageCanvas)
	var self = this
	this.stage.on("end", function () {
		self.moveToNextStage()
	})
	this.lastBrickCrackingHandler = undefined
	this.stage.on("last_brick", function (lastBrickRect) {
		self.handleLastBrickRemaining(lastBrickRect)
	})
}

Game.prototype.startGame = function () {
	this.curState = this.state.running

	if(!this.lastBrickCrackingHandler && stageDatas.length > this.currentStage && this.lifeCount > 0) {
	}
}

Game.prototype.operateBall = function () {
	if (this.curState == this.state.waiting) {
		// Ball will stick to the bat
		var batTopCenter = this.bat.centerTop()
		for (var index = 0; index < this.balls.length; index++) {
			this.balls[index].stickBottomToPoint(batTopCenter.x, batTopCenter.y)
		}
	} else {
		// Ball will be moving in each frame
		var extraBallsDroppedToBottom = []
		for (index = 0; index < this.balls.length; index++) {

			// window collision
			var bottomCollided = this.balls[index].handleCollisionWithWindowReportBottomCollision(this.windowWidth, this.windowHeight)
			if (bottomCollided) {
				if (this.balls.length == 1) { //last ball
					this.lastBallDroppedToBottom()
				} else {
					extraBallsDroppedToBottom.push(this.balls[index])
				}
			}

			// bat collision
			var batRect = this.bat.relativeBatRect()
			const ballBatCollided = this.balls[index].handleCollisionWithBat(batRect.x, batRect.width, batRect.y)
			if (ballBatCollided) {
			}

			// stage collision
			const brickCollisionResult = this.stage.handleBrickCollisionWithBallAndReportCollision(this.balls[index])
			if (brickCollisionResult) {
				this.stage.draw()
			}
			this.balls[index].handleBrickCollisionResult(brickCollisionResult)

			// move ball
			this.balls[index].move()
		}

		for (index = 0; index < extraBallsDroppedToBottom.length; index++) {
			var ballIndex = this.balls.indexOf(extraBallsDroppedToBottom[index])
			if (ballIndex > -1) {
				this.balls.splice(ballIndex, 1)
			}
		}
	}
}


Game.prototype.moveToNextStage = function () {


	if(this.lastBrickCrackingHandler) {
		this.lastBrickCrackingHandler.handleStagePassed()
		this.lastBrickCrackingHandler = undefined
	}

	if (this.currentStage < stageDatas.length - 1) {
		this.currentStage++
		this.curState = this.state.waiting
		this.stage.setNewStageData(stageDatas[this.currentStage])
		this.stage.draw()
	} else {
		this.curState = this.state.no_more_stages
		if (this.callbacks["all_stage_finished"]) {
			this.callbacks["all_stage_finished"](this.stage.score)
		}
		this.stage.clearDrawing()
	}
}

Game.prototype.handleLastBrickRemaining = function (lastBrickRect) {
	if (!this.lastBrickCrackingHandler && this.curState == this.state.running) {
		console.log("handle last brick remaining called")
		this.lastBrickCrackingHandler = new LastBrickCrackingHandler(30, lastBrickRect)
		var self = this
		this.lastBrickCrackingHandler.on("end", function() {
			self.lastBrickCrackingHandler = undefined
			self.moveToNextStage()
		})
	}


}


// Give appropriate name
Game.prototype.lastBallDroppedToBottom = function () {
	this.currentPower = undefined
	this.curState = this.state.waiting
	this.lifeCount--

	// Reset ball angles
	for (let index = 0; index < this.balls.length; index++) {
		this.balls[index].initialAngleSpeedSetup()
	}

	if (this.lifeCount == 0) {
		this.curState = this.state.no_more_life
		if (this.callbacks["no_more_life"]) {
			this.callbacks["no_more_life"](this.stage.score)
			this.stage.clearDrawing()
		}
		if(this.lastBrickCrackingHandler) {
			this.lastBrickCrackingHandler.handleStagePassed()
			this.lastBrickCrackingHandler = undefined
		}
	}
}

Game.prototype.on = function (event, callback) {
	this.callbacks[event] = callback
}

Game.prototype.draw = function () {

	// clear screen
	// this.ctx.fillStyle = "#000000"
	// this.ctx.fillRect(0, 0, this.windowWidth, this.windowHeight)
	this.ctx.clearRect(0, 0, this.windowWidth, this.windowHeight)

	if (this.curState == this.state.no_more_stages || this.curState == this.state.no_more_life) {
		this.drawGameOver()
		this.drawScore()
		this.drawStageName()
	} else {
		this.drawLife()
		this.drawScore()
		this.drawStageName()

		// Ball movement, collision reporting and handling
		this.operateBall()

		// stage drawing
		// this.stage.draw(this.ctx)

		// power drawing
		if (this.currentPower) {
			this.currentPower.draw(this.ctx)
		}

		// ball drawing
		for (var index = 0; index < this.balls.length; index++) {
			this.balls[index].draw(this.ctx)
		}

		// thunder drawing
		if(this.lastBrickCrackingHandler) {
			this.lastBrickCrackingHandler.draw(this.ctx)
		}

		// last brick remaining time
		this.drawLastBrickRemainingTime()
	}
}

Game.prototype.drawLife = function () {
	var heartImage = document.getElementById("heart_image")

	var margin = 10
	var width = 40
	var height = 40

	var curX = this.windowWidth - margin - width

	for (var index = 0; index < this.lifeCount; index++) {
		this.ctx.drawImage(heartImage, curX, margin, width, height)
		curX -= (margin + width)
	}
}

Game.prototype.drawScore = function () {
	var margin = 10

	this.ctx.fillStyle = "#FFFFFF"
	this.ctx.font = "30px Comic Sans MS"
	this.ctx.textBaseline = "top"
	this.ctx.textAlign = "left"
	this.ctx.fillText(`Score : ${this.stage.score}`, margin, margin)
}

Game.prototype.drawStageName = function () {

	var margin = 10

	this.ctx.fillStyle = "#FFFFFF"
	this.ctx.font = "30px Comic Sans MS"
	this.ctx.textBaseline = "top"
	this.ctx.textAlign = "center"
	this.ctx.fillText(stageDatas[this.currentStage].name, this.windowWidth / 2, margin)
}

Game.prototype.drawGameOver = function () {
	var gameOverImage = document.getElementById("game_over_image")

	var imageX = (this.windowWidth - gameOverImage.width) / 2

	this.ctx.drawImage(gameOverImage, imageX, 50)
}

Game.prototype.drawLastBrickRemainingTime = function () {
	if (this.lastBrickCrackingHandler) {
		this.ctx.fillStyle = "#FF0000"
		this.ctx.font = "40px Comic Sans MS"
		this.ctx.textBaseline = "center"
		this.ctx.textAlign = "center"
		this.ctx.fillText(`${this.lastBrickCrackingHandler.remainingSeconds()}`, this.windowWidth / 2, this.windowHeight / 2)
	}
}

Game.prototype.increaseLife = function () {
	var maxLife = 5 // So far it's here, no one other required it. If required place it in a suitable place
	if (this.lifeCount < maxLife) {
		this.lifeCount++
	}
}

Game.prototype.decreaseLife = function () {
	this.lastBallDroppedToBottom()
}