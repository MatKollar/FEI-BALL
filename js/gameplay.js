$(document).ready(function () {
  // setup gameplay
  const game = new Game(
    window.innerWidth,
    window.innerHeight,
    $("#canvas")[0],
    $("#bat_canvas")[0],
    $("#stage_canvas")[0]
  );
  const fps = 60;
  const intervalId = setInterval(gameloop, 1000 / fps);

  // Event listeners
  $(window).resize(() => {
    game.windowResized(window.innerWidth, window.innerHeight);
  });

  $("body").mousemove((event) => {
    game.mouseMoved(event.clientX);
  });

  $("body").mouseup(() => {
    game.startGame();
  });

  $("#main_menu_btn").click(() => {
    window.location = "/index.html";
  });

  // Event handlers
  game.on("all_stage_finished", (score) => {
    setTimeout(() => {
      clearInterval(intervalId);
      updateScore(score);
      $("#main_menu_btn").show().removeClass("d-none");
    }, 500);
  });

  game.on("no_more_life", (score) => {
    setTimeout(() => {
      clearInterval(intervalId);
      $("#main_menu_btn").show().removeClass("d-none");
    }, 500);
  });

  function gameloop() {
    game.draw();
  }
});
