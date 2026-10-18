// The kiln: a translucent zone square holding one pot in its inventory. A dried, unfired pot put in
// fires for KILN_FIRE_MS, cools for KILN_COOL_MS, then waits, shown as a box, to be taken out.
// States: empty -> firing -> cooling -> ready -> empty. The square's colour shows the state.
// The pot can only be taken once ready (transferItem(kiln.inventory, fox.inventory)).
Crafty.c("Kiln", {
    init: function() {
        this.requires("2D, DOM, Color, Delay");
        var kiln = this;
        this.inventory = new Inventory(KILN_CAPACITY, {
            accepts: function (item) { return item.state === "dried"; },
            releases: function (item) { return kiln.state === "ready" && item.state === "cooled"; }
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

    setState: function(state) {
        this.state = state;
        this.color(KILN_STATE_COLORS[state]);
    },

    startFiring: function() {
        this.setState("firing");
        this.inventory.items[0].advance("firing");
        this.delay(function () {
            this.setState("cooling");
            this.inventory.items[0].advance("cooling");
            this.delay(this.finishPot, KILN_COOL_MS, 0);
        }, KILN_FIRE_MS, 0);
    },

    finishPot: function() {
        this.inventory.items[0].advance("cooled");
        this.setState("ready");
        // Centred on the square; placed now because the kiln's position is set after init.
        this.potBox.attr({
            x: this.x + (this.w - this.potBox.w) / 2,
            y: this.y + (this.h - this.potBox.h) / 2,
            z: this.z + 1,
            visible: true
        });
    }
});
