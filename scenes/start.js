var START_STORY =
    "In a cosy cabin at the edge of the wood, Master Potter Owl keeps the last kiln in the valley. " +
    "His eyes have grown dim with the years, but his hands still remember every curve of the wheel.<br><br>" +
    "You are his new apprentice. Villagers send orders to the Master and each must be made just as asked." +
    "Fetch the clay, glaze and gather the firewood" +
    "one careful step at a time, and carry the finished pots to the waiting customers. " +
    "Together you can keep this centuries-old craft glowing.";

Crafty.defineScene("Start", function() {
    Crafty.background("#DDD");
    audioController.playMusic(MUSIC_TRACK);

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: GAME_SCREEN_HEIGHT * 0.14, w: GAME_SCREEN_WIDTH, h: 60})
        .text("Ludum Dare #60")
        .textAlign("center")
        .textFont({ size: '48px', weight: 'bold' })
        .textColor('#222')
        .unselectable();

    // The opening story, between the title and the Play button.
    Crafty.e("2D, DOM, Text")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 450, y: GAME_SCREEN_HEIGHT * 0.14 + 70, w: 900, h: 200})
        .text(START_STORY)
        .textAlign("center")
        .textFont({ size: '19px', style: 'italic' })
        .textColor('#333')
        .css({"line-height": "1.5"})
        .unselectable();

    // Play picks a level to play (scenes/levels.js); Sandbox (DEV_MODE only) is the whole game at once for testing.
    Crafty.e("UIButton")
        .label("Play")
        .attr({x: GAME_SCREEN_WIDTH / 2 - 80, y: GAME_SCREEN_HEIGHT * 0.62})
        .onClick(function () {
            Crafty.scene("LevelSelect");
        });

    if (DEV_MODE) {
        Crafty.e("UIButton")
            .label("Sandbox")
            .attr({x: GAME_SCREEN_WIDTH / 2 - 80, y: GAME_SCREEN_HEIGHT * 0.62 + 70})
            .onClick(function () {
                Crafty.scene("Game", {mode: "sandbox"});
            });
    }

    Crafty.e("MuteButton").attr({x: 20, y: 20});

    showCredits(CREDITS, GAME_SCREEN_HEIGHT - 30);
});
