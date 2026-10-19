// Text that floats above the entity it follows (the fox) and fades out. Create one per Game scene, then from anywhere:
//   Crafty.e("PlayerNotification").follow(player);
//   Crafty.trigger("InstructionText", "Arrow keys to move. Click and Hold to dig clay");
// Each message is shown once per run, then fades out.
Crafty.c("PlayerNotification", {
    init: function() {
        this.requires("2D, DOM, Text, Delay, Tween");
        this.attr({w: 400, h: 40, z: 2000, alpha: 0});
        this.textAlign("center").textFont({ size: '24px', weight: 'bold' }).textColor('#222').unselectable();
        this.css({ textShadow: '0 0 4px #FFF' });
        this.seen = {};
        this.bind("InstructionText", this.show);
    },

    // Centres the text above the entity and moves with it.
    follow: function(entity) {
        this.attr({x: entity.x + (entity.w - this.w) / 2, y: entity.y - this.h});
        entity.attach(this);
        return this;
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
