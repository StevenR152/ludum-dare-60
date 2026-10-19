Crafty.init(GAME_SCREEN_WIDTH,GAME_SCREEN_HEIGHT, document.getElementById('game'));

// On touch screens: touch and hold to walk toward the finger, tap for SPACE.
// The Game and level scenes point hold-toward at each new player with TouchControls.follow.
TouchControls.init({
    holdToward: {},
    tap: "SPACE",
    scenes: ["Game", "Level1", "Level2", "Level3"]
});

// Entities with the "HUD" component stay fixed on screen while the camera moves.
Crafty.createLayer("HUD", "DOM", {xResponse: 0, yResponse: 0, scaleResponse: 0, z: 50});

// Debug overlays (DEBUG_HITBOXES): the collision masks sit above the HUD (50) and the red outlines above
// the masks, both following the camera like the world.
if (DEBUG_HITBOXES) {
    Crafty.createLayer("DebugMaskLayer", "DOM", {z: 60});
    Crafty.createLayer("DebugOutlineLayer", "DOM", {z: 70});
}

var audioController = Crafty.e("AudioController");

Crafty.scene("Loading");
