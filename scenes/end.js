Crafty.defineScene("End", function() {
    Crafty.background("#DDD");
    audioController.playMusic(MUSIC_TRACK);

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: GAME_SCREEN_HEIGHT * 0.25, w: GAME_SCREEN_WIDTH, h: 60})
        .text("Time: " + formatTime(gameState.seconds))
        .textAlign("center")
        .textFont({ size: '36px', weight: 'bold' })
        .textColor('#222')
        .unselectable();

    Crafty.e("UIButton")
        .label("Play again")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 80, y: GAME_SCREEN_HEIGHT / 2})
        .onClick(function () {
            resetGameState();
            Crafty.scene("Game");
        });

    Crafty.e("MuteButton").attr({x: 20, y: 20});
});
