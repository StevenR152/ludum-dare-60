// The game is laid out on a fixed GAME_SCREEN_WIDTH x GAME_SCREEN_HEIGHT screen. This fits it to whatever
// space the page has (a browser window, an itch.io iframe, fullscreen, a phone): the world and HUD layers are
// scaled together and the stage shrinks or grows to match, so Crafty's mouse mapping (which knows the viewport
// scale but not CSS transforms) stays accurate. The page centres the stage (see index.html), which
// letterboxes the leftover space.
function fitScreenToWindow() {
    var scale = Math.min(document.documentElement.clientWidth / GAME_SCREEN_WIDTH,
        window.innerHeight / GAME_SCREEN_HEIGHT);
    Crafty.viewport.scale(scale);
    Crafty.stage.elem.style.width = GAME_SCREEN_WIDTH * scale + "px";
    Crafty.stage.elem.style.height = GAME_SCREEN_HEIGHT * scale + "px";
    // Plain DOM panels inside the stage size themselves from this (see the weighing station).
    Crafty.stage.elem.style.setProperty("--game-scale", scale);
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
