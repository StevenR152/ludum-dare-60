// Drop into any scene: Crafty.e("MuteButton").attr({x: 20, y: 20});
// Shows text until art exists; pass sprite component names to swap in icons:
// Crafty.e("MuteButton").icons("music_on", "music_off")
Crafty.c("MuteButton", {
    init: function() {
        this.requires("2D, HUD, Mouse, Text");
        this.attr({w: 90, h: 30, z: 1000});
        this.textFont({ size: '16px', weight: 'bold' }).textColor(HUD_TEXT_COLOR).css({fontFamily: MENU_FONT}).unselectable();
        this.css({ cursor: 'pointer' });
        this.onIcon = null;
        this.offIcon = null;
        this.bind("Click", function () {
            audioController.toggleMute();
        });
        this.bind("MuteChanged", this.refresh);
        this.refresh();
    },

    icons: function(onSprite, offSprite) {
        this.onIcon = onSprite;
        this.offIcon = offSprite;
        this.text("");
        return this.refresh();
    },

    refresh: function() {
        var muted = audioController.isMuted();
        if (this.onIcon) {
            var size = {w: this.w, h: this.h};
            this.removeComponent(muted ? this.onIcon : this.offIcon);
            this.addComponent(muted ? this.offIcon : this.onIcon);
            this.attr(size);
        } else {
            this.text(muted ? "Music: off" : "Music: on");
        }
        return this;
    }
});
