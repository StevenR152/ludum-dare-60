Crafty.defineScene("End", function() {
    Crafty.background(MENU_BACKGROUND);
    audioController.playMusic(MUSIC_TRACK);

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: GAME_SCREEN_HEIGHT * 0.25, w: GAME_SCREEN_WIDTH, h: 60})
        .text("Time: " + formatTime(gameState.seconds))
        .textAlign("center")
        .textFont({ size: '36px', weight: 'bold' })
        .textColor(MENU_TEXT_COLOR)
        .unselectable();

    Crafty.e("UIButton")
        .label("Play again")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 80, y: GAME_SCREEN_HEIGHT / 2})
        .onClick(function () {
            resetGameState();
            Crafty.scene("Game");
        });

    Crafty.e("UIButton")
        .label("Menu")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 80, y: GAME_SCREEN_HEIGHT / 2 + 70})
        .onClick(function () { Crafty.scene("Start"); });

    menuMuteButton();
});
