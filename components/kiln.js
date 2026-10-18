// The kiln: a translucent zone square holding up to KILN_CAPACITY pots, plus a wood inventory of up to
// KILN_WOOD_CAPACITY logs. A dried pot and wood go in, in either order; the torch (see game.js) calls
// light() to start. Firing uses up the wood: its count is the fire level (1 low, 2 mid, 3 high), kept on
// the kiln and every pot. The pots fire together for KILN_FIRE_MS, cool for KILN_COOL_MS, then wait to be taken out.
// States: empty -> loaded (pots in) -> firing -> cooling -> ready -> empty (once all are taken). Pots can only
// go in while empty or loaded, and only be taken once ready (transferItem(kiln.inventory, fox.inventory)).
// The square's colour shows the state.
Crafty.c("Kiln", {
    init: function() {
        this.requires("2D, DOM, Color, Delay");
        var kiln = this;
        this.inventory = new Inventory(KILN_CAPACITY, {
            accepts: function (item) { return item.state === "dried" && (kiln.state === "empty" || kiln.state === "loaded"); },
            releases: function (item) { return kiln.state === "ready" && item.state === "cooled"; }
        });
        this.woodInventory = new Inventory(KILN_WOOD_CAPACITY, {
            accepts: function (item) { return item.type === "log"; }
        });
        this.fireLevel = null;
        this.potBoxes = [];
        for (var i = 0; i < KILN_CAPACITY; i++) {
            this.potBoxes.push(Crafty.e("2D, DOM, Color")
                .attr({w: 40, h: 40, visible: false})
                .color(FIRED_POT_COLOR));
        }
        this.setState("empty");
        this.bind("InventoryChanged", function (changed) {
            if (changed !== this.inventory) {
                return;
            }
            if (this.state === "empty" && this.inventory.items.length > 0) {
                this.setState("loaded");
            } else if (this.state === "ready") {
                this.showPots();
                if (this.inventory.items.length === 0) {
                    this.setState("empty");
                }
            }
        });
    },

    setState: function(state) {
        this.state = state;
        this.color(KILN_STATE_COLORS[state]);
    },

    // Starts firing if there is a pot and wood; otherwise says what is missing. Returns true if lit.
    light: function() {
        if (this.state !== "loaded" && this.state !== "empty") {
            showStatus("The kiln is already lit");
        } else if (this.state === "empty") {
            showStatus("Put a pot in the kiln first");
        } else if (this.woodInventory.items.length === 0) {
            showStatus("Put wood in the kiln first");
        } else {
            this.startFiring();
            return true;
        }
        return false;
    },

    startFiring: function() {
        var logs = this.woodInventory.items.length;
        this.fireLevel = KILN_FIRE_LEVELS[logs - 1];
        this.woodInventory.items.length = 0;
        this.woodInventory.selected = 0;
        this.woodInventory.changed();
        this.setState("firing");
        this.inventory.items.forEach(function (pot) {
            pot.fireLevel = this.fireLevel;
            pot.advance("firing");
        }, this);
        showStatus("The kiln is lit: " + this.fireLevel + " fire");
        this.delay(function () {
            this.setState("cooling");
            this.inventory.items.forEach(function (pot) { pot.advance("cooling"); });
            this.delay(this.finishPot, KILN_COOL_MS, 0);
        }, KILN_FIRE_MS, 0);
    },

    finishPot: function() {
        this.inventory.items.forEach(function (pot) { pot.advance("cooled"); });
        this.setState("ready");
        this.showPots();
    },

    // One box per pot waiting, in a row centred on the square (placed now: the kiln's position is set after init).
    showPots: function() {
        var count = this.inventory.items.length;
        var gap = 10;
        this.potBoxes.forEach(function (box, i) {
            var rowW = count * box.w + (count - 1) * gap;
            box.attr({
                x: this.x + (this.w - rowW) / 2 + i * (box.w + gap),
                y: this.y + (this.h - box.h) / 2,
                z: this.z + 1,
                visible: i < count
            });
        }, this);
    }
});
