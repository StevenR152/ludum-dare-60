// The kiln: an invisible zone square holding one pot in its inventory. Every pot is fired twice, each
// time for KILN_FIRE_MS then cooling for KILN_COOL_MS, then it waits, shown as a box, to be taken out:
// - bisque: an unfired pot at any dryness goes firing -> cooling -> cooled; it cracks unless it went in
//   bone dry (and at its clay's fire level), which only shows once it has cooled;
// - glaze firing: a cooled (unglazed) or glazed pot goes glazeFiring -> glazeCooling -> glazeCooled.
// Kiln states: empty -> firing -> cooling -> ready -> empty. The picture is lit while firing.
// The pot can only be taken once ready (transferItem(kiln.inventory, fox.inventory)).
var KILN_PASSES = {
    bisque: {firing: "firing", cooling: "cooling", done: "cooled"},
    glaze: {firing: "glazeFiring", cooling: "glazeCooling", done: "glazeCooled"}
};

Crafty.c("Kiln", {
    init: function() {
        this.requires("2D, DOM, Delay, DebugHitbox");
        var kiln = this;
        this.inventory = new Inventory(KILN_CAPACITY, {
            // Pots only go in while the kiln waits to be lit, never while it fires or while fired pots wait to be taken.
            accepts: function (item) { return (kiln.state === "empty" || kiln.state === "loaded") && !!kiln.passFor(item); },
            releases: function () { return kiln.state === "ready"; }
        });
        this.woodInventory = new Inventory(KILN_WOOD_CAPACITY, {
            accepts: function (item) { return item.type === "log"; }
        });
        this.fireLevel = null;
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
        // Each pot keeps the pass it started with: its state changes as it fires.
        this.passes = this.inventory.items.map(this.passFor, this);
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
            this.inventory.items.forEach(function (pot, i) { pot.advance(this.passes[i].cooling); }, this);
            this.delay(this.finishPot, KILN_COOL_MS, 0);
        }, KILN_FIRE_MS, 0);
    },

    finishPot: function() {
        this.inventory.items.forEach(function (pot, i) { pot.advance(this.passes[i].done); }, this);
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
            var pot = this.inventory.items[i];
            paintItem(box, pot);
            markBorder(box, pot);
        }, this);
    }
});
