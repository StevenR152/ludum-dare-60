// The kiln: an invisible zone square holding one pot in its inventory. Every pot is fired twice, each
// time for KILN_FIRE_MS then cooling for KILN_COOL_MS, then it waits, shown as a box, to be taken out:
// - bisque: an unfired pot at any dryness goes firing -> cooling -> cooled; it cracks unless it went in
//   bone dry (and at its clay's fire level), which only shows once it has cooled;
// - glaze firing: a cooled (unglazed) or glazed pot goes glazeFiring -> glazeCooling -> glazeCooled.
// Kiln states: empty -> loaded -> firing -> cooling -> ready -> empty. The picture is lit while firing.
// The pot can only be taken once ready (transferItem(kiln.inventory, fox.inventory)). Nothing goes in or out
// while firing; while cooling only wood goes in. Fresh pots may be added to a ready kiln next to the fired ones
// (kiln.finished lists those); once those are taken the kiln is loaded (or empty) again.
var KILN_PASSES = {
    bisque: {firing: "firing", cooling: "cooling", done: "cooled"},
    glaze: {firing: "glazeFiring", cooling: "glazeCooling", done: "glazeCooled"}
};

Crafty.c("Kiln", {
    init: function() {
        this.requires("2D, DOM, Delay, DebugHitbox");
        var kiln = this;
        this.inventory = new Inventory(KILN_CAPACITY, {
            // Pots go in whenever the kiln isn't firing or cooling, including while fired pots wait (they keep their own state).
            accepts: function (item) { return (kiln.state === "empty" || kiln.state === "loaded" || kiln.state === "ready") && !!kiln.passFor(item); },
            // Pots come out once fired, or before the kiln is lit (e.g. the wrong one went in).
            releases: function () { return kiln.state === "ready" || kiln.state === "loaded"; }
        });
        this.woodInventory = new Inventory(KILN_WOOD_CAPACITY, {
            // Wood can't be added while the fire burns (cooling is fine) and can't come out once the kiln is lit.
            accepts: function (item) { return item.type === "log" && kiln.state !== "firing"; },
            releases: function () { return kiln.state === "empty" || kiln.state === "loaded" || kiln.state === "ready"; }
        });
        this.fireLevel = null;
        this.finished = []; // the pots that came out of the last firing and still wait to be taken (not freshly added ones)
        this.potBoxes = [];
        for (var i = 0; i < KILN_CAPACITY; i++) {
            this.potBoxes.push(Crafty.e("2D, DOM, Color")
                .attr({w: 40, h: 40, visible: false}));
        }
        this.setState("empty");
        this.bind("InventoryChanged", function (changed) {
            if (changed !== this.inventory) {
                return;
            }
            var items = this.inventory.items;
            if (this.state === "empty" && items.length > 0) {
                this.setState("loaded");
            } else if (this.state === "ready") {
                this.finished = this.finished.filter(function (pot) { return items.indexOf(pot) >= 0; });
                if (this.finished.length > 0) {
                    this.showPots();
                } else {
                    // Every fired pot is out: any fresh pots left are just loaded, waiting for wood.
                    this.setState(items.length > 0 ? "loaded" : "empty");
                    this.potBoxes.forEach(function (box) { box.visible = false; });
                }
            } else if (this.state === "loaded" && items.length === 0) {
                this.setState("empty");
            }
        });
    },

    // What the next take-out would remove, as {inventory, index}, or null: a finished pot first, then a fresh pot,
    // then a log. Nothing comes out while the kiln fires or cools.
    nextOut: function() {
        if (this.state === "ready") {
            var index = this.inventory.items.findIndex(function (pot) { return this.finished.indexOf(pot) >= 0; }, this);
            return index >= 0 ? {inventory: this.inventory, index: index} : null;
        }
        if (this.state === "empty" || this.state === "loaded") {
            if (this.inventory.items.length > 0) {
                return {inventory: this.inventory, index: 0};
            }
            return this.woodInventory.items.length > 0 ? {inventory: this.woodInventory, index: 0} : null;
        }
        return null;
    },

    // The slot a click by this fox would really take out (for the HUD outline), or null: the fox needs a free slot,
    // and a click that loads wood or deposits the held item takes nothing.
    takeTarget: function(fox) {
        var held = fox.inventory.selectedItem();
        if (fox.inventory.items.length >= fox.inventory.capacity || (held && held.type === "log")) {
            return null;
        }
        return this.state === "ready" || !held ? this.nextOut() : null;
    },

    // Which firing a pot is ready for, or null.
    passFor: function(item) {
        if (item.state === "thrown" && !item.pot.cracked) {
            return KILN_PASSES.bisque;
        }
        return item.state === "cooled" || item.state === "glazed" ? KILN_PASSES.glaze : null;
    },

    setState: function(state) {
        this.state = state;
        if (this.art) {
            this.showArt();
        }
        Crafty.trigger("KilnStateChanged", this); // the HUD outline depends on the state
    },

    // Draws the kiln picture (lit only while firing) over KILN_ART_BOX; the zone itself stays invisible.
    placeArt: function() {
        this.art = {
            idle: fitArt(Crafty.e("2D, DOM, kilnBase"), KILN_ART_CONTENT, KILN_ART_BOX),
            lit: fitArt(Crafty.e("2D, DOM, kilnFiring"), KILN_ART_CONTENT, KILN_ART_BOX)
        };
        this.bind("Remove", function () { this.art.idle.destroy(); this.art.lit.destroy(); });
        this.showArt();
        return this;
    },

    showArt: function() {
        var lit = this.state === "firing";
        this.art.idle.visible = !lit;
        this.art.lit.visible = lit;
    },

    // Starts firing if there is a pot and wood; otherwise says what is missing. Returns true if lit.
    light: function() {
        if (this.state === "ready") {
            showStatus("I need to take the finished pots out of the kiln first");
        } else if (this.state !== "loaded" && this.state !== "empty") {
            showStatus("The kiln is already lit");
        } else if (this.woodInventory.items.length === 0) {
            showStatus("Put wood in the kiln first");
        } else {
            this.startFiring();
            return true;
        }
        return false;
    },

    startFiring: function() {
        // Each pot keeps the pass it started with: its state changes as it fires.
        this.passes = this.inventory.items.map(this.passFor, this);
        this.finished = [];
        this.setState("firing");
        var logs = this.woodInventory.items.length;
        this.fireLevel = KILN_FIRE_LEVELS[logs - 1];
        this.woodInventory.items.length = 0;
        this.woodInventory.selected = 0;
        this.woodInventory.changed();
        showStatus("The kiln is lit: " + this.fireLevel + " fire");
        Crafty.trigger("KilnLit");
        this.inventory.items.forEach(function (pot, i) {
            if (this.passes[i] === KILN_PASSES.bisque) {
                pot.setFireLevel(this.fireLevel);
            }
            pot.advance(this.passes[i].firing);
        }, this);
        this.delay(function () {
            this.setState("cooling");
            Crafty.trigger("KilnCooling"); // fires even when the kiln is empty, so the fire sound always ends
            this.inventory.items.forEach(function (pot, i) { pot.advance(this.passes[i].cooling); }, this);
            this.delay(this.finishPot, KILN_COOL_MS, 0);
        }, KILN_FIRE_MS, 0);
    },

    finishPot: function() {
        this.inventory.items.forEach(function (pot, i) { pot.advance(this.passes[i].done); }, this);
        this.finished = this.inventory.items.slice();
        this.setState(this.inventory.items.length > 0 ? "ready" : "empty"); // fired empty: nothing to collect
        this.showPots();
        this.inventory.changed(); // the pots changed state: redraw the HUD (badges, no drying bar)
    },

    // One box per pot waiting, in a row centred on the square, then moved KILN_OUTPUT_OFFSET so the pots clear the
    // torch's click zone (placed now: the kiln's position is set after init).
    showPots: function() {
        var count = this.inventory.items.length;
        var gap = 10;
        this.potBoxes.forEach(function (box, i) {
            var rowW = count * box.w + (count - 1) * gap;
            box.attr({
                x: this.x + (this.w - rowW) / 2 + i * (box.w + gap) + KILN_OUTPUT_OFFSET.x,
                y: this.y + (this.h - box.h) / 2 + KILN_OUTPUT_OFFSET.y,
                z: this.z + 1,
                visible: i < count
            });
            var pot = this.inventory.items[i];
            paintItem(box, pot);
            markBorder(box, pot);
        }, this);
    }
});
