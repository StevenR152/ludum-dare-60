// The mission list: one button per level (scenes/levels.js), each played alone. Levels open in order as
// each is completed, unless UNLOCK_ALL_LEVELS is on; a locked one keeps its place in the list, dimmed and
// with its name withheld, so the player can see how much craft is still ahead of them. "Back" returns to
// Start. Shares the menu look with Loading and Start (MENU_* in constants.js).
var MISSION_BUTTON_W = 400;
var MISSION_BUTTON_H = 54;
var MISSION_ROW_GAP = 68;

Crafty.defineScene("LevelSelect", function() {
    Crafty.background(MENU_BACKGROUND);
    audioController.playMusic(MUSIC_TRACK);

    var done = levelsDone();
    var top = GAME_SCREEN_HEIGHT * 0.13;

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: top, w: GAME_SCREEN_WIDTH, h: 70, z: 2})
        .text("Missions")
        .textAlign("center")
        .textFont({ size: '54px', weight: '700' })
        .textColor(MENU_TEXT_COLOR)
        .unselectable()
        .css({fontFamily: MENU_FONT, letterSpacing: "1px",
              textShadow: "0 3px 16px rgba(0, 0, 0, 0.6)"});

    // How far along the player is, rather than leaving the locked rows to explain themselves.
    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: top + 72, w: GAME_SCREEN_WIDTH, h: 26, z: 2})
        .text(UNLOCK_ALL_LEVELS ? "EVERY MISSION OPEN" : done + " OF " + LEVELS.length + " COMPLETED")
        .textAlign("center")
        .textFont({ size: '13px', weight: '600' })
        .textColor(MENU_DIM_TEXT_COLOR)
        .unselectable()
        .css({fontFamily: MENU_FONT, letterSpacing: "3px"});

    menuRule(top + 112, 220);

    // Two columns, filled top to bottom (the left one first), so a long list fits the screen.
    var rows = Math.ceil(LEVELS.length / 2);
    var listTop = top + 150;
    LEVELS.forEach(function (level, index) {
        var column = Math.floor(index / rows);
        var unlocked = levelUnlocked(index);
        var button = Crafty.e("UIButton")
            .attr({x: GAME_SCREEN_WIDTH / 2 - 420 + column * 440, y: listTop + (index % rows) * MISSION_ROW_GAP,
                   w: MISSION_BUTTON_W, h: MISSION_BUTTON_H})
            .css({lineHeight: MISSION_BUTTON_H + "px"});
        if (unlocked) {
            button.clickSound = "uiSelect";
            button.label((index + 1) + ".  " + level.name)
                .onClick(function () { Crafty.scene("Game", {stage: index, mode: "single"}); });
        } else {
            // The next one along is named, so there is something to aim at; the rest stay a secret.
            var teased = index === done + 1;
            button.label((index + 1) + ".  " + (teased ? level.name : "—") + "   🔒").locked();
        }
    });

    var back = Crafty.e("UIButton")
        .label("Back")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 90, y: listTop + rows * MISSION_ROW_GAP + 26, w: 180, h: 48});
    back.clickSound = "uiBack";
    back.onClick(function () { Crafty.scene("Start"); });

    menuMuteButton();
});
