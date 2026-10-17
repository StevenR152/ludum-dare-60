// Bottom-centre line for "you can't do that" feedback. Unlike PlayerNotification,
// it shows every time, so repeated mistakes are still explained.
//   Crafty.e("StatusMessage");          // once per Game scene
//   showStatus("Backpack full, you can't put more in");
Crafty.c("StatusMessage", {
    init: function() {
        this.requires("2D, HUD, Text, Delay, Tween");
        this.attr({x: 0, y: GAME_SCREEN_HEIGHT - 60, w: GAME_SCREEN_WIDTH, h: 30, z: 2000, alpha: 0});
        this.textAlign("center").textFont({ size: '20px', weight: 'bold' }).textColor('#FFF').unselectable();
        this.css({ textShadow: '0 0 4px #000' });
        this.bind("StatusText", this.show);
    },

    show: function(message) {
        this.cancelDelay(this.fadeOut);
        this.cancelTween("alpha");
        this.text(message);
        this.alpha = 1;
        this.delay(this.fadeOut, 2500);
    },

    fadeOut: function() {
        this.tween({alpha: 0}, 600);
    }
});

// Logs to the console and shows the message on screen.
function showStatus(message) {
    console.log(message);
    Crafty.trigger("StatusText", message);
}
