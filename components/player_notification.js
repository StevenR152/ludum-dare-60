// Text that floats above the entity it follows (the fox) and fades out. Create one per Game scene, then from anywhere:
//   Crafty.e("PlayerNotification").follow(player);
//   showStatus("Arrow keys to move");   // see status_message.js; shown every time, then fades out
Crafty.c("PlayerNotification", {
    init: function() {
        this.requires("2D, DOM, Text, Delay, Tween");
        this.attr({w: 400, h: 40, z: 2000, alpha: 0});
        this.textAlign("center").textColor('#222').unselectable();
        this.css({ textShadow: '0 0 4px #FFF' });
        this.textFont({ size: "12px", weight: "bold" });
        this.bind("StatusText", this.show);
    },

    // Centres the text above the entity and moves with it.
    follow: function(entity) {
        this.attr({x: entity.x + (entity.w - this.w) / 2, y: entity.y - this.h + 40});
        entity.attach(this);
        return this;
    },

    // `message` is the text, or {text, extraMs} to keep it up longer than usual.
    show: function(message) {
        var extraMs = message.extraMs;
        message = message.text || message;
        this.cancelDelay(this.fadeOut);
        this.cancelTween("alpha");
        this.text(message);
        this.alpha = 1;
        // Longer messages stay up longer.
        this.delay(this.fadeOut, 1500 + message.length * 50 + (extraMs || 0));
    },

    fadeOut: function() {
        this.tween({alpha: 0}, 600);
    }
});
