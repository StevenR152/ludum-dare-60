Crafty.init(GAME_SCREEN_WIDTH,GAME_SCREEN_HEIGHT, document.getElementById('game'));

// On touch screens: touch and hold to walk toward the finger, tap for SPACE.
// The Game scene points hold-toward at each new player with TouchControls.follow.
TouchControls.init({
    holdToward: {},
    tap: "SPACE",
    scenes: ["Game"]
});

// Entities with the "HUD" component stay fixed on screen while the camera moves.
Crafty.createLayer("HUD", "DOM", {xResponse: 0, yResponse: 0, scaleResponse: 1, z: 50});

// The HUD scales with the screen (camera.js) but stays pinned to the stage's top-left corner. Crafty scales a layer
// about the screen centre, so the HUD layer reports a fixed top-left view of the whole screen instead
// (an internal hook of Crafty 0.9; it places the HUD and maps mouse clicks onto it).
Crafty.s("HUD")._viewportRect = function (useCached) {
    var rect = this._cachedViewportRect;
    if (!useCached) {
        rect._scale = Crafty.viewport._scale;
        rect._w = GAME_SCREEN_WIDTH;
        rect._h = GAME_SCREEN_HEIGHT;
        rect._x = 0;
        rect._y = 0;
    }
    return rect;
};

// Debug overlays (DEBUG_HITBOXES): the collision masks sit above the HUD (50) and the red outlines above
// the masks, both following the camera like the world.
if (DEBUG_HITBOXES) {
    Crafty.createLayer("DebugMaskLayer", "DOM", {z: 60});
    Crafty.createLayer("DebugOutlineLayer", "DOM", {z: 70});
}

// Fit the screen to the window now and whenever it is resized.
fitScreenToWindow();
window.addEventListener("resize", fitScreenToWindow);
// Crafty resets the viewport scale to 1 on every scene change (just before SceneChange).
Crafty.bind("SceneChange", fitScreenToWindow);

var audioController = Crafty.e("AudioController");

Crafty.scene("Loading");
