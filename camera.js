// The game screen is GAME_SCREEN_WIDTH x GAME_SCREEN_HEIGHT; on smaller windows the world and HUD layers are
// scaled down together and the stage shrinks to match, so everything fits and Crafty's mouse mapping
// (which knows the viewport scale but not CSS transforms) stays accurate. Never scales above 1.
// Touch devices are fitted by TouchControls instead, so they stay at 1.
function screenFitScale() {
    if (TouchControls.isActive()) {
        return 1;
    }
    // Fit the width the page has left after a scrollbar, and the height left under the page title.
    var width = document.documentElement.clientWidth;
    var height = window.innerHeight - Crafty.stage.elem.offsetTop;
    return Math.min(1, width / GAME_SCREEN_WIDTH, height / GAME_SCREEN_HEIGHT);
}

function fitScreenToWindow() {
    var scale = screenFitScale();
    Crafty.viewport.scale(scale);
    Crafty.stage.elem.style.width = GAME_SCREEN_WIDTH * scale + "px";
    Crafty.stage.elem.style.height = GAME_SCREEN_HEIGHT * scale + "px";
    Crafty.viewport.width = GAME_SCREEN_WIDTH * scale;
    Crafty.viewport.height = GAME_SCREEN_HEIGHT * scale;
    Crafty.viewport.reload();
}

function makeCameraTrackEntity(entity, yoffset) {
    // Sets up the Camera Tracking to the player entity
    Crafty.viewport.clampToEntities = false;
    Crafty.one("CameraAnimationDone", function () {
        Crafty.viewport.follow(entity, 0, 0 + yoffset);
    });
    Crafty.viewport.centerOn(entity, 0);
}
