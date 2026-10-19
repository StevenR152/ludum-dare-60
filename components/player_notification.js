// Text that floats above the entity it follows (the fox) and fades out. Create one per Game scene, then from anywhere:
//   Crafty.e("PlayerNotification").follow(player);
//   showStatus("Arrow keys to move");   // see status_message.js; shown every time, then fades out
var STATUS_BASE_MS = 1500;
var STATUS_PER_CHAR_MS = 50;
var STATUS_FADE_MS = 600;

// How long a message is on screen, fade included.
function statusVisibleMs(text) {
    return STATUS_BASE_MS + text.length * STATUS_PER_CHAR_MS + STATUS_FADE_MS;
}

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

    // `message` is the text, or {text, extraMs} to keep it up longer than usual. {text, packHint: true} also
    // starts the golden flash on the fox's selected slot for as long as the message is up.
    show: function(message) {
        var extraMs = message.extraMs;
        var packHint = message.packHint;
        message = message.text || message;
        if (packHint) {
            Crafty.trigger("PackFullHint", statusVisibleMs(message) + (extraMs || 0));
        }
        this.cancelDelay(this.fadeOut);
        this.cancelTween("alpha");
        this.text(message);
        this.alpha = 1;
        // Longer messages stay up longer.
        this.delay(this.fadeOut, STATUS_BASE_MS + message.length * STATUS_PER_CHAR_MS + (extraMs || 0));
    },

    fadeOut: function() {
        this.tween({alpha: 0}, STATUS_FADE_MS);
    }
});
