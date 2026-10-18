Crafty.init(GAME_SCREEN_WIDTH,GAME_SCREEN_HEIGHT, document.getElementById('game'));

// On touch screens: touch and hold to walk toward the finger, tap for SPACE.
// The Game scene points hold-toward at each new player with TouchControls.follow.
TouchControls.init({
    holdToward: {},
    tap: "SPACE",
    scenes: ["Game", "Level1", "Level2"]
});

// Entities with the "HUD" component stay fixed on screen while the camera moves.
Crafty.createLayer("HUD", "DOM", {xResponse: 0, yResponse: 0, scaleResponse: 0, z: 50});

var audioController = Crafty.e("AudioController");

Crafty.scene("Loading");
