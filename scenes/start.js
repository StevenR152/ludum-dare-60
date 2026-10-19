// The title screen. Shares the menu look with Loading and Missions (MENU_* in constants.js): firelight in
// a dark workshop, Alegreya, and clay-coloured buttons.
var START_STORY =
    "In a cosy cabin at the edge of the wood, Master Potter Owl keeps the last kiln in the valley. " +
    "His eyes have grown dim with the years, but his hands still remember every curve of the wheel.<br><br>" +
    "You are his new apprentice. Villagers send orders to the Master and each must be made just as asked. " +
    "Fetch the clay, glaze and gather the firewood, " +
    "one careful step at a time, and display the pots for customers to collect. " +
    "Together you can keep this centuries-old craft alive.";

Crafty.defineScene("Start", function() {
    Crafty.background(MENU_BACKGROUND);
    audioController.playMusic(MUSIC_TRACK);

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: 118, w: GAME_SCREEN_WIDTH, h: 90, z: 2})
        .text(GAME_TITLE)
        .textAlign("center")
        .textFont({ size: '68px', weight: '700' })
        .textColor(MENU_TEXT_COLOR)
        .unselectable()
        .css({fontFamily: MENU_FONT, letterSpacing: "1px",
              textShadow: "0 3px 18px rgba(0, 0, 0, 0.65), 0 0 46px rgba(242, 140, 40, 0.16)"});

    // The jam still gets its credit, just not as the game's name.
    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: 206, w: GAME_SCREEN_WIDTH, h: 26, z: 2})
        .text("A LUDUM DARE 60 GAME · THEME: OLD TECH")
        .textAlign("center")
        .textFont({ size: '13px', weight: '600' })
        .textColor(MENU_DIM_TEXT_COLOR)
        .unselectable()
        .css({fontFamily: MENU_FONT, letterSpacing: "3px"});

    menuRule(252, 220);

    Crafty.e("2D, DOM, Text")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 430, y: 292, w: 860, h: 220, z: 2})
        .text(START_STORY)
        .textAlign("center")
        // Italic is textFont's `type`. Crafty writes the whole `font` shorthand on every draw from type,
        // variant, weight, size, lineHeight and family, so a `style` key is ignored and a css() font-style
        // is reset; this story was never italic before for exactly that reason.
        .textFont({ size: '21px', type: 'italic' })
        .textColor("rgba(227, 205, 168, 0.88)")
        .unselectable()
        .css({fontFamily: MENU_FONT, lineHeight: "1.7", textShadow: "0 1px 4px rgba(0, 0, 0, 0.5)"});

    // Play picks a mission (scenes/levels.js); Sandbox (DEV_MODE only) is the whole game at once for testing.
    Crafty.e("UIButton")
        .label("Play")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 110, y: 556, w: 220, h: 58})
        .css({lineHeight: "58px", fontSize: "24px"})
        .onClick(function () {
            Crafty.scene("LevelSelect");
        });

    if (DEV_MODE) {
        Crafty.e("UIButton")
            .label("Sandbox")
            .attr({x: GAME_SCREEN_WIDTH / 2 - 110, y: 626, w: 220, h: 48})
            .onClick(function () {
                Crafty.scene("Game", {mode: "sandbox"});
            });
    }

    menuMuteButton();

    showCredits(CREDITS, GAME_SCREEN_HEIGHT - 34);
});
