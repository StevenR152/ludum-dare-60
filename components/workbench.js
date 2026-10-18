// The workbench: a zone square inside the house. Hold the mouse on it for WEDGE_MS while the fox
// touches it, and the clay the fox has selected becomes wedged (it advances to "wedged"); the owl
// only takes wedged clay. One hold measures out and wedges one kilo.
//   Crafty.e("Workbench").attr({x: INSIDE_X + 300, y: 560, w: 300, h: 160});
Crafty.c("Workbench", {
    init: function() {
        this.requires("2D, DOM, Color, Mouse, Delay, Collision");
        this.color(WORKBENCH_COLOR);
        this.bind("MouseDown", this.startWedge);
        this.bind("MouseUp", this.cancelWedge);
        this.bind("MouseOut", this.cancelWedge);
    },

    touchingFox: function() {
        var hits = this.hit("Fox");
        return hits ? hits[0].obj : null;
    },

    // Unwedged clay the fox has selected, or null (with a status saying why).
    clayToWedge: function() {
        var fox = this.touchingFox();
        if (!fox) {
            showStatus("Walk up to the workbench first");
            return null;
        }
        var clay = fox.inventory.selectedItem();
        if (!clay || clay.type !== "clay") {
            showStatus("Carry some clay to wedge it");
            return null;
        }
        if (clay.state !== "dug") {
            showStatus("That clay is already wedged");
            return null;
        }
        return clay;
    },

    startWedge: function() {
        if (this.clayToWedge()) {
            showStatus("Wedging, keep holding");
            this.delay(this.finishWedge, WEDGE_MS);
        }
    },

    cancelWedge: function() { this.cancelDelay(this.finishWedge); },

    // The fox may have walked off or changed clay mid-hold; check again.
    finishWedge: function() {
        var clay = this.clayToWedge();
        if (!clay) {
            return;
        }
        clay.advance("wedged");
        this.touchingFox().inventory.changed();
        showStatus("Wedged one kilo of " + clay.clay.name + " clay");
    }
});
