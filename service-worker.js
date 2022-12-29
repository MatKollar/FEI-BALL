self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("my-cache").then(function (cache) {
      return cache.addAll([
        "/index.html",
        "/game.html",
        "/howtoplay.html",
        "/description.html",
        "/css/game.css",
        "/css/description.css",
        "/css/howtoplay.css",
        "/css/index.css",
        "/css/print.css",
        "/js/game.js",
        "/js/assets/Ball.js",
        "/js/assets/Board.js",
        "/js/assets/GameLogic.js",
        "/js/assets/Stage.js",
        "/js/assets/Timer.js",
        "/images/FEI_BALL_BG.png",
        "/images/FEI-BALL.png",
        "/images/feiball_favicon.png",
        "/images/gameover.png",
        "/images/Instructions_mobile.png",
        "/images/Instructions.png",
        "/images/life.png",
        "/images/Victory.png",
      ]);
    })
  );
});
