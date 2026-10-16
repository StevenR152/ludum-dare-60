Crafty.init(GAME_SCREEN_WIDTH,GAME_SCREEN_HEIGHT, document.getElementById('game'));

// Entities with the "HUD" component stay fixed on screen while the camera moves.
Crafty.createLayer("HUD", "DOM", {xResponse: 0, yResponse: 0, scaleResponse: 0, z: 50});

var audioController = Crafty.e("AudioController");

Crafty.scene("Loading");
