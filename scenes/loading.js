Crafty.defineScene("Loading", function() {
    Crafty.background("#AAA");
    Crafty.e("2D, DOM, Text")
          .attr({ w: 200, h: 50, x: GAME_SCREEN_WIDTH / 2 - 100, y: GAME_SCREEN_HEIGHT / 2 - 20 })
          .text("Loading...")
          .textFont({ size: '20px', weight: 'bold' })
          .textAlign("center")
          .textColor("#111");

    // gameAssets is defined in assets.js
  	Crafty.load(gameAssets, function(){
       setTimeout(function () {
         Crafty.scene('Start');
       }, 1000);
    },  function () {
      console.log("Crafty Load Issue");
    },  function (e) {
      console.log("Crafty Load Error", e);
    });
  });
