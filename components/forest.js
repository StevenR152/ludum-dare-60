// A tree: an invisible zone Outside (the forest zone is cut into one per tree). Hold the mouse on it for
// LOG_CHOP_MS while the fox touches it to chop one log into the fox's pack. Trees never run out.
// `plant` draws its picture standing at the bottom middle of the zone.
//   Crafty.e("Forest").attr({x: 5, y: 350, w: 105, h: 307}).plant(FOREST_TREES[0]);
Crafty.c("Forest", {
    init: function() {
        this.requires("2D, DOM, Mouse, Delay, Collision, DebugHitbox");
        this.bind("MouseDown", this.startChop);
        this.bind("MouseUp", this.cancelChop);
        this.bind("MouseOut", this.cancelChop);
    },

    plant: function(tree) {
        var art = Crafty.e("2D, DOM, " + tree.sprite);
        var w = tree.content[2] * TREE_SCALE;
        var h = tree.content[3] * TREE_SCALE;
        fitArt(art, tree.content, {x: this.x + (this.w - w) / 2 + tree.dx, y: this.y + this.h - h + tree.dy, w: w, h: h});
        this.bind("Remove", function () { art.destroy(); });
        return this;
    },

    touchingFox: function() {
        var hits = this.hit("Fox");
        return hits ? hits[0].obj : null;
    },

    startChop: function() {
        if (!this.touchingFox()) {
            showStatus("Walk into the forest first");
            return;
        }
        showStatus("Chopping, keep holding");
        this.delay(this.finishChop, LOG_CHOP_MS);
    },

    cancelChop: function() { this.cancelDelay(this.finishChop); },

    // The fox may have walked off mid-hold; pickUp explains a full or mixed pack.
    finishChop: function() {
        var fox = this.touchingFox();
        if (fox && fox.pickUp({type: "log"})) {
            showStatus("Chopped a log");
        }
    }
});
