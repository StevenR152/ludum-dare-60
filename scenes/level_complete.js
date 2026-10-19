// Shown when a level's orders are all delivered. The scene is given the finished level's index.
Crafty.defineScene("LevelComplete", function(index) {
    var level = LEVELS[index];
    Crafty.background("#DDD");
    audioController.playMusic(MUSIC_TRACK);

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: GAME_SCREEN_HEIGHT * 0.2, w: GAME_SCREEN_WIDTH, h: 60})
        .text("Level " + (index + 1) + " complete: " + level.name)
        .textAlign("center")
        .textFont({ size: '40px', weight: 'bold' })
        .textColor('#222')
        .unselectable();
    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: GAME_SCREEN_HEIGHT * 0.2 + 70, w: GAME_SCREEN_WIDTH, h: 40})
        .text("Time: " + formatTime(gameState.seconds))
        .textAlign("center")
        .textFont({ size: '30px', weight: 'bold' })
        .textColor('#222')
        .unselectable();

    var y = GAME_SCREEN_HEIGHT / 2;
    if (index < LEVELS.length - 1) {
        Crafty.e("UIButton")
            .label("Next level")
            .attr({x: GAME_SCREEN_WIDTH / 2 - 80, y: y})
            .onClick(function () { Crafty.scene(LEVELS[index + 1].scene); });
        y += 70;
    }
    Crafty.e("UIButton")
        .label("Level select")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 80, y: y})
        .onClick(function () { Crafty.scene("LevelSelect"); });

    Crafty.e("MuteButton").attr({x: 20, y: 20});
});
