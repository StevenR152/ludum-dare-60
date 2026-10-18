// The forest: a zone square Outside. Hold the mouse on it for LOG_CHOP_MS while the fox touches it
// to chop one log into the fox's pack. The forest never runs out.
//   Crafty.e("Forest").attr({x: 5, y: 350, w: 525, h: 307});
Crafty.c("Forest", {
    init: function() {
        this.requires("2D, DOM, Color, Mouse, Delay, Collision");
        this.color(FOREST_COLOR);
        this.bind("MouseDown", this.startChop);
        this.bind("MouseUp", this.cancelChop);
        this.bind("MouseOut", this.cancelChop);
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
