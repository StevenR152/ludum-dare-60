// The mission list: one button per level (scenes/levels.js); locked ones do nothing. "Back" returns to Start.
Crafty.defineScene("LevelSelect", function() {
    Crafty.background("#DDD");
    audioController.playMusic(MUSIC_TRACK);

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: GAME_SCREEN_HEIGHT * 0.15, w: GAME_SCREEN_WIDTH, h: 60})
        .text("Missions")
        .textAlign("center")
        .textFont({ size: '48px', weight: 'bold' })
        .textColor('#222')
        .unselectable();

    LEVELS.forEach(function (level, index) {
        var button = Crafty.e("UIButton")
            .attr({x: GAME_SCREEN_WIDTH / 2 - 200, y: GAME_SCREEN_HEIGHT * 0.15 + 100 + index * 70, w: 400});
        if (levelUnlocked(index)) {
            button.label((index + 1) + "  " + level.name)
                .onClick(function () { Crafty.scene(level.scene); });
        } else {
            button.label((index + 1) + "  " + level.name + "  (locked)")
                .css({backgroundColor: "#999", cursor: "default"});
            button.setHover = function () {};
        }
    });

    Crafty.e("UIButton")
        .label("Back")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 80, y: GAME_SCREEN_HEIGHT * 0.15 + 100 + LEVELS.length * 70 + 20})
        .onClick(function () { Crafty.scene("Start"); });

    Crafty.e("MuteButton").attr({x: 20, y: 20});
});
