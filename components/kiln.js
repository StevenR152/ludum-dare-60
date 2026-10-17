// The kiln: a translucent zone square that fires one unfired pot for KILN_FIRE_MS,
// cools it for KILN_COOL_MS, then holds the fired pot, shown as a box, until takePot().
// States: empty -> firing -> cooling -> ready -> empty. The square's colour shows the state.
Crafty.c("Kiln", {
    init: function() {
        this.requires("2D, DOM, Color, Delay");
        this.potBox = Crafty.e("2D, DOM, Color")
            .attr({w: 40, h: 40, visible: false})
            .color(FIRED_POT_COLOR);
        this.setState("empty");
    },

    setState: function(state) {
        this.state = state;
        this.color(KILN_STATE_COLORS[state]);
    },

    // Takes an unfired pot and starts firing it. Returns false if the kiln can't take it.
    loadPot: function(pot) {
        if (this.state !== "empty" || !pot || pot.type !== "pot" || pot.fired) {
            return false;
        }
        this.setState("firing");
        this.delay(function () {
            this.setState("cooling");
            this.delay(this.finishPot, KILN_COOL_MS, 0);
        }, KILN_FIRE_MS, 0);
        return true;
    },

    finishPot: function() {
        this.setState("ready");
        // Centred on the square; placed now because the kiln's position is set after init.
        this.potBox.attr({
            x: this.x + (this.w - this.potBox.w) / 2,
            y: this.y + (this.h - this.potBox.h) / 2,
            z: this.z + 1,
            visible: true
        });
    },

    // Returns the fired pot, or null if there isn't one, and empties the kiln.
    takePot: function() {
        if (this.state !== "ready") {
            return null;
        }
        this.potBox.visible = false;
        this.setState("empty");
        return {type: "pot", fired: true};
    }
});
