// Shown when a level's orders are all delivered. The scene is given the finished level's index.
// Shares the menu look with Loading, Start and Missions (MENU_* in constants.js).
Crafty.defineScene("LevelComplete", function(index) {
    var level = LEVELS[index];
    Crafty.background(MENU_BACKGROUND);
    audioController.playMusic(MUSIC_TRACK);
    var top = GAME_SCREEN_HEIGHT * 0.2;

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: top, w: GAME_SCREEN_WIDTH, h: 34, z: 2})
        .text("MISSION " + (index + 1) + " COMPLETE")
        .textAlign("center")
        .textFont({ size: '14px', weight: '600' })
        .textColor(MENU_DIM_TEXT_COLOR)
        .unselectable()
        .css({fontFamily: MENU_FONT, letterSpacing: "4px"});

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: top + 36, w: GAME_SCREEN_WIDTH, h: 70, z: 2})
        .text(level.name)
        .textAlign("center")
        .textFont({ size: '48px', weight: '700' })
        .textColor(MENU_TEXT_COLOR)
        .unselectable()
        .css({fontFamily: MENU_FONT, textShadow: "0 3px 16px rgba(0, 0, 0, 0.6)"});

    menuRule(top + 120, 200);

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: top + 146, w: GAME_SCREEN_WIDTH, h: 40, z: 2})
        .text("Time  " + formatTime(gameState.seconds))
        .textAlign("center")
        .textFont({ size: '26px' })
        .textColor("rgba(227, 205, 168, 0.86)")
        .unselectable()
        .css({fontFamily: MENU_FONT, letterSpacing: "1px"});

    var y = GAME_SCREEN_HEIGHT / 2 + 60;
    if (index < LEVELS.length - 1) {
        Crafty.e("UIButton")
            .label("Next mission")
            .attr({x: GAME_SCREEN_WIDTH / 2 - 110, y: y, w: 220, h: 54})
            .css({lineHeight: "54px"})
            .onClick(function () { Crafty.scene("Game", {stage: index + 1, mode: "single"}); });
        y += 70;
    }
    var back = Crafty.e("UIButton")
        .label("Missions")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 110, y: y, w: 220, h: 54})
        .css({lineHeight: "54px"});
    back.clickSound = "uiBack";
    back.onClick(function () { Crafty.scene("LevelSelect"); });

    menuMuteButton();
});
