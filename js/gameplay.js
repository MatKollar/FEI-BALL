$(document).ready(function () {
  // setup gameplay
  let game = new Game(
    window.innerWidth,
    window.innerHeight,
    $("#canvas")[0],
    $("#bat_canvas")[0],
    $("#stage_canvas")[0]
  );
  const fps = 60;
  let intervalId = setInterval(gameloop, 1000 / fps);

  // Events
  function gameloop() {
    game.draw();
  }

  $(window).resize(function () {
    game.windowResized(window.innerWidth, window.innerHeight);
  });

  $("body").mousemove(function (event) {
    game.mouseMoved(event.clientX);
  });

  $("body").mouseup(function () {
    game.startGame();
  });

  $("#main_menu_btn").click(function () {
    window.location = "/index.html";
  });

  game.on("all_stage_finished", function (score) {
    setTimeout(function () {
      clearInterval(intervalId);
      updateScore(score);
      $("#main_menu_btn").show().removeClass("d-none");
    }, 500);
  });

  game.on("no_more_life", function (score) {
    setTimeout(function () {
      clearInterval(intervalId);
      $("#main_menu_btn").show().removeClass("d-none");
    }, 500);
  });
});
