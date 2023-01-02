$(document).ready(() => {
  fetch("stage_data.json")
    .then((response) => response.json())
    .then((data) => {
      chooseDifficulty(data);
    });
});

const chooseDifficulty = (stageData) => {
  const $difficultyPage = $("#difficulty");
  const $easy = $("#easy");
  const $hard = $("#hard");

  $easy.click(() => {
    $difficultyPage.hide();
    startGame(stageData, "EASY");
  });

  $hard.click(() => {
    $difficultyPage.hide();
    startGame(stageData, "HARD");
  });
};

const startGame = (stageData, difficulty) => {
  const gameLogic = new GameLogic(
    window.innerWidth,
    window.innerHeight,
    $("#canvas")[0],
    $("#board_canvas")[0],
    $("#stage_canvas")[0],
    stageData,
    difficulty
  );
  const fps = 60;
  const intervalId = setInterval(gameloop, 1000 / fps);
  const $pauseMenu = $("#pauseMenu");
  const $mainMenu = $("#mainMenu");

  $(window).resize(() => {
    gameLogic.updateScreenSize(window.innerWidth, window.innerHeight);
  });

  $("body").mouseup(() => {
    if (gameLogic.curState !== "PAUSED") {
      gameLogic.startGame();
    }
  });

  $(document).on("keydown", (event) => {
    if (event.keyCode === 27) {
      gameLogic.pauseGame();
      if ($pauseMenu.is(":visible")) {
        $pauseMenu.hide();
      } else {
        $pauseMenu.show().removeClass("d-none");
      }
    }
  });

  gameLogic.on("victory", () => {
    setTimeout(() => {
      clearInterval(intervalId);
      $mainMenu.show().removeClass("d-none");
    }, 50);
  });

  gameLogic.on("gameover", () => {
    setTimeout(() => {
      clearInterval(intervalId);
      $mainMenu.show().removeClass("d-none");
    }, 50);
  });

  function gameloop() {
    gameLogic.draw();
  }
};
