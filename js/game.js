$(document).ready(() => {
  fetch("stage_data.json")
    .then((response) => response.json())
    .then((data) => {
      startGame(data);
    });
});

const startGame = (stageDatas) => {
  const gameLogic = new GameLogic(
    window.innerWidth,
    window.innerHeight,
    $("#canvas")[0],
    $("#bat_canvas")[0],
    $("#stage_canvas")[0],
    stageDatas
  );
  const fps = 60;
  const intervalId = setInterval(gameloop, 1000 / fps);
  const $mainMenuBtn = $("#main_menu_btn");

  $(window).resize(() => {
    gameLogic.updateScreenSize(window.innerWidth, window.innerHeight);
  });

  $("body").mousemove((event) => {
    gameLogic.mouseMoved(event.clientX);
  });

  $("body").mouseup(() => {
    gameLogic.startGame();
  });

  $mainMenuBtn.click(() => {
    window.location = "/index.html";
  });

  gameLogic.on("all_stage_finished", (score) => {
    setTimeout(() => {
      clearInterval(intervalId);
      $mainMenuBtn.show().removeClass("d-none");
    }, 500);
  });

  gameLogic.on("no_more_life", (score) => {
    setTimeout(() => {
      clearInterval(intervalId);
      $mainMenuBtn.show().removeClass("d-none");
    }, 500);
  });

  function gameloop() {
    gameLogic.draw();
  }
};
