// Debug outline: a red border on a separate overlay that tracks the entity's box, drawn above the art.
// Does nothing unless DEBUG_HITBOXES (constants.js) is true, so components can always require it.
//   this.requires("DebugHitbox");
// For a different border colour call .debugBorder("lime") on the entity (safe to call when debugging is off).
Crafty.c("DebugHitbox", {
    init: function() {
        this.requires("2D");
        if (!DEBUG_HITBOXES) {
            return;
        }
        // DebugOutlineLayer (main.js) sits above the HUD and the collision masks, so outlines stay visible.
        var outline = Crafty.e("2D, DOM, DebugOutlineLayer")
            .css({border: "2px solid red", boxSizing: "border-box", pointerEvents: "none"})
            .attr({z: 1000});
        var sync = function () {
            outline.attr({x: this.x, y: this.y, w: this.w, h: this.h});
        };
        this.bind("Move", sync);
        this.debugOutline = outline;
        this.bind("Resize", sync);
        this.bind("Remove", function () { outline.destroy(); });
        sync.call(this);
    },
    debugBorder: function (color) {
        if (this.debugOutline) {
            this.debugOutline.css({borderColor: color});
        }
        return this;
    }
});
