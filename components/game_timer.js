function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
}

// Counts up once a second into gameState.seconds and shows mm:ss on the HUD.
// Stops with the scene, and pauses with Crafty.pause().
Crafty.c("GameTimer", {
    init: function() {
        this.requires("2D, HUD, Text, Delay");
        this.attr({w: 80, h: 30, z: 1000});
        this.textFont({ size: '18px', weight: 'bold' }).textColor('#222').unselectable();
        this.text(formatTime(gameState.seconds));
        this.delay(this.tick, 1000, -1);
    },

    tick: function() {
        gameState.seconds += 1;
        this.text(formatTime(gameState.seconds));
    }
});
