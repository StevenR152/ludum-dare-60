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
// about the screen centre, so this replaces its position/scale update (an internal hook of Crafty 0.9).
Crafty.s("HUD")._setViewport = function () {
    var style = this._div.style;
    style.transform = style[Crafty.support.prefix + "Transform"] = "scale(" + Crafty.viewport._scale + ")";
    style.left = "0px";
    style.top = "0px";
    style.zIndex = this.options.z;
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
