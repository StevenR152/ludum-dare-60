// An area that measures how long it is held down (mouse or touch; Crafty's
// Mouse component translates touch events into mouse events).
//   Crafty.e("TimeClickable").attr({x: 100, y: 100, w: 200, h: 200});
// Logs "Clicked for 123ms" on release.
Crafty.c("TimeClickable", {
    init: function() {
        this.requires("2D, DOM, Mouse");
        this.pressedAt = null;
        this.bind("MouseDown", this.startPress);
        this.bind("MouseUp", this.endPress);
    },

    startPress: function() {
        this.pressedAt = Date.now();
    },

    endPress: function() {
        if (this.pressedAt === null) {
            return;
        }
        var elapsed = Date.now() - this.pressedAt;
        this.pressedAt = null;
        console.log("Clicked for " + elapsed + "ms");
        this.trigger("TimeClicked", elapsed);
    }
});
