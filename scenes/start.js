Crafty.defineScene("Start", function() {
    Crafty.background("#DDD");
    audioController.playMusic(MUSIC_TRACK);

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: GAME_SCREEN_HEIGHT * 0.25, w: GAME_SCREEN_WIDTH, h: 60})
        .text("Ludum Dare #60")
        .textAlign("center")
        .textFont({ size: '48px', weight: 'bold' })
        .textColor('#222')
        .unselectable();

    Crafty.e("UIButton")
        .label("Play")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 80, y: GAME_SCREEN_HEIGHT / 2})
        .onClick(function () {
            Crafty.scene("LevelSelect");
        });

    Crafty.e("MuteButton").attr({x: 20, y: 20});

    showCredits(CREDITS, GAME_SCREEN_HEIGHT - 30);
});
