function showWholeWorld() {
    // Static camera that scales the WORLD_WIDTH x WORLD_HEIGHT map to fill the screen.
    // HUD-layer entities are unaffected (see main.js).
    Crafty.viewport.clampToEntities = false;
    Crafty.viewport.scale(GAME_SCREEN_WIDTH / WORLD_WIDTH);
    Crafty.viewport.scroll('_x', 0);
    Crafty.viewport.scroll('_y', 0);
}
