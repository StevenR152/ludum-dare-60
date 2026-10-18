// The kiln: a translucent zone square holding one pot in its inventory. Every pot is fired twice, each
// time for KILN_FIRE_MS then cooling for KILN_COOL_MS, then it waits, shown as a box, to be taken out:
// - bisque: a dried pot goes firing -> cooling -> cooled;
// - glaze firing: a cooled (unglazed) or glazed pot goes glazeFiring -> glazeCooling -> glazeCooled.
// Kiln states: empty -> firing -> cooling -> ready -> empty. The square's colour shows the state.
// The pot can only be taken once ready (transferItem(kiln.inventory, fox.inventory)).
var KILN_PASSES = {
    bisque: {firing: "firing", cooling: "cooling", done: "cooled"},
    glaze: {firing: "glazeFiring", cooling: "glazeCooling", done: "glazeCooled"}
};

Crafty.c("Kiln", {
    init: function() {
        this.requires("2D, DOM, Color, Delay");
        var kiln = this;
        this.inventory = new Inventory(KILN_CAPACITY, {
            accepts: function (item) { return !!kiln.passFor(item); },
            releases: function () { return kiln.state === "ready"; }
        });
        this.potBox = Crafty.e("2D, DOM, Color")
            .attr({w: 40, h: 40, visible: false})
            .color(FIRED_POT_COLOR);
        this.setState("empty");
        this.bind("InventoryChanged", function (changed) {
            if (changed !== this.inventory) {
                return;
            }
            if (this.state === "empty" && this.inventory.items.length > 0) {
                this.startFiring();
            } else if (this.state === "ready" && this.inventory.items.length === 0) {
                this.potBox.visible = false;
                this.setState("empty");
            }
        });
    },

    // Which firing a pot is ready for, or null.
    passFor: function(item) {
        if (item.state === "dried") {
            return KILN_PASSES.bisque;
        }
        return item.state === "cooled" || item.state === "glazed" ? KILN_PASSES.glaze : null;
    },

    setState: function(state) {
        this.state = state;
        this.color(KILN_STATE_COLORS[state]);
    },

    startFiring: function() {
        var pot = this.inventory.items[0];
        var pass = this.passFor(pot);
        this.setState("firing");
        pot.advance(pass.firing);
        this.delay(function () {
            this.setState("cooling");
            pot.advance(pass.cooling);
            this.delay(function () { this.finishPot(pot, pass); }, KILN_COOL_MS, 0);
        }, KILN_FIRE_MS, 0);
    },

    finishPot: function(pot, pass) {
        pot.advance(pass.done);
        this.setState("ready");
        // Centred on the square; placed now because the kiln's position is set after init.
        this.potBox.attr({
            x: this.x + (this.w - this.potBox.w) / 2,
            y: this.y + (this.h - this.potBox.h) / 2,
            z: this.z + 1,
            visible: true
        }).color(itemColor(pot));
    }
});
