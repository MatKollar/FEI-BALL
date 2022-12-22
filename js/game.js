$(document).ready(() => {
  const game = new Game(
    window.innerWidth,
    window.innerHeight,
    $("#canvas")[0],
    $("#bat_canvas")[0],
    $("#stage_canvas")[0]
  );
  const fps = 60;
  const intervalId = setInterval(gameloop, 1000 / fps);
  const $mainMenuBtn = $("#main_menu_btn");

  $(window).resize(() => {
    game.updateScreenSize(window.innerWidth, window.innerHeight);
  });

  $("body").mousemove((event) => {
    game.mouseMoved(event.clientX);
  });

  $("body").mouseup(() => {
    game.startGame();
  });

  $mainMenuBtn.click(() => {
    window.location = "/index.html";
  });

  game.on("all_stage_finished", (score) => {
    setTimeout(() => {
      clearInterval(intervalId);
      $mainMenuBtn.show().removeClass("d-none");
    }, 500);
  });

  game.on("no_more_life", (score) => {
    setTimeout(() => {
      clearInterval(intervalId);
      $mainMenuBtn.show().removeClass("d-none");
    }, 500);
  });

  function gameloop() {
    game.draw();
  }
});
