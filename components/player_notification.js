// Create one per Game scene, then from anywhere:
//   Crafty.trigger("InstructionText", "Arrow keys to move");
// Each message is shown once per run, then fades out.
Crafty.c("PlayerNotification", {
    init: function() {
        this.requires("2D, HUD, Text, Delay, Tween");
        this.attr({x: 0, y: GAME_SCREEN_HEIGHT * 0.15, w: GAME_SCREEN_WIDTH, h: 40, z: 2000, alpha: 0});
        this.textAlign("center").textFont({ size: '24px', weight: 'bold' }).textColor('#222').unselectable();
        this.seen = {};
        this.bind("InstructionText", this.show);
    },

    show: function(message) {
        if (this.seen[message]) {
            return;
        }
        this.seen[message] = true;
        this.cancelDelay(this.fadeOut);
        this.cancelTween("alpha");
        this.text(message);
        this.alpha = 1;
        // Longer messages stay up longer.
        this.delay(this.fadeOut, 1500 + message.length * 50);
    },

    fadeOut: function() {
        this.tween({alpha: 0}, 600);
    }
});
