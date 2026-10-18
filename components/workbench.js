// The workbench: a zone square inside the house with three parts, all used while the fox touches it.
// - The bench itself: hold the mouse on it for WEDGE_MS with dug clay selected to wedge that kilo onto
//   the bench piles (an Inventory with one wedged Pottery per clay). Kilos of the same clay add up;
//   different clays sit side by side.
// - Scales (left): click to choose a clay and grams on a slider and weigh them off that pile (see
//   Scales). Each weighed piece is one clay, so clays are never weighed together.
// - Models (right): one per ORDER_SHAPES x ORDER_SIZES; click one to carry it to the owl. It comes
//   back to its spot on "ModelReturned".
//   Crafty.e("Workbench").place(INSIDE_X + 600, 560, 520, 200);
Crafty.c("Workbench", {
    init: function() {
        this.requires("2D, DOM, Color, Mouse, Delay, Collision");
        this.color(WORKBENCH_COLOR);
        this.pile = new Inventory(Object.keys(CLAY_TYPES).length, {fits: function () { return true; }});
        this.parts = [];
        this.modelSpots = [];
        this.bind("MouseDown", this.startWedge);
        this.bind("MouseUp", this.cancelWedge);
        this.bind("MouseOut", this.cancelWedge);
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.pile) {
                this.drawPile();
            }
        });
        this.bind("ModelReturned", this.returnModel);
        this.bind("Remove", function () {
            this.parts.forEach(function (part) { part.destroy(); });
        });
    },

    // Parts are laid out from the bench's position, so they are made here rather than in init.
    place: function(x, y, w, h) {
        this.attr({x: x, y: y, w: w, h: h});
        this.parts.push(Crafty.e("Scales").attr({x: x + 10, y: y + 30, w: 140, h: 140, z: this.z + 1}).forBench(this));
        // One row per clay type, filled while that clay has a pile.
        this.pileBoxes = {};
        Object.keys(CLAY_TYPES).forEach(function (name, row) {
            var box = Crafty.e("2D, DOM, Color, Text")
                .attr({x: x + 165, y: y + 30 + row * 48, w: 140, h: 44, z: this.z + 1})
                .textFont({size: "16px", weight: "bold"}).textColor("#FFF").unselectable()
                .css({lineHeight: "44px", textAlign: "center", textShadow: "0 0 3px #000"});
            this.pileBoxes[name] = box;
            this.parts.push(box);
        }, this);
        ORDER_SHAPES.forEach(function (shape, row) {
            ORDER_SIZES.forEach(function (size, col) {
                this.addModelSpot({type: "model", shape: shape, size: size},
                    x + 320 + col * 66, y + 10 + row * 62);
            }, this);
        }, this);
        this.drawPile();
        return this;
    },

    addModelSpot: function(model, x, y) {
        var bench = this;
        var spot = Crafty.e("2D, DOM, Color, Text, Mouse")
            .attr({x: x, y: y, w: 62, h: 56, z: this.z + 1})
            .text(model.size.charAt(0) + " " + model.shape)
            .textFont({size: "12px", weight: "bold"}).textColor("#FFF").unselectable()
            .css({lineHeight: "56px", textAlign: "center"});
        spot.model = model;
        spot.home = true;
        spot.bind("MouseDown", function () { bench.takeModel(spot); });
        this.parts.push(spot);
        this.modelSpots.push(spot);
        this.drawModelSpot(spot);
    },

    drawModelSpot: function(spot) {
        spot.color(spot.home ? MODEL_COLOR : "rgba(255, 255, 255, 0.25)");
    },

    takeModel: function(spot) {
        var fox = this.touchingFox();
        if (!fox) {
            showStatus("Walk up to the workbench first");
        } else if (!spot.home) {
            showStatus("That model is already out");
        } else if (fox.pickUp(spot.model)) {
            spot.home = false;
            this.drawModelSpot(spot);
            showStatus("Picked up the " + spot.model.size + " " + spot.model.shape + " model");
        }
    },

    // A model dropped while the fox is at the bench goes back to its spot (the fox's offerToStations).
    acceptDrop: function(item) {
        if (item.type !== "model") {
            return false;
        }
        Crafty.trigger("ModelReturned", item);
        showStatus("Put the model back on the bench");
        return true;
    },

    returnModel: function(model) {
        this.modelSpots.forEach(function (spot) {
            if (spot.model === model) {
                spot.home = true;
                this.drawModelSpot(spot);
            }
        }, this);
    },

    drawPile: function() {
        Object.keys(this.pileBoxes).forEach(function (name) {
            var clay = this.pileClay(name);
            this.pileBoxes[name].color(clay ? clay.clay.color : "rgba(255, 255, 255, 0.25)")
                .text(clay ? name + " " + clay.clay.weight + " g" : "");
        }, this);
    },

    // The wedged Pottery of that clay on the bench, or null.
    pileClay: function(name) {
        return this.pile.items.find(function (item) { return item.clay.name === name; }) || null;
    },

    touchingFox: function() {
        var hits = this.hit("Fox");
        return hits ? hits[0].obj : null;
    },

    // Dug clay the fox has selected that may join the pile, or null (with a status saying why).
    clayToWedge: function() {
        var fox = this.touchingFox();
        if (!fox) {
            showStatus("Walk up to the workbench first");
            return null;
        }
        var clay = fox.inventory.selectedItem();
        if (!clay || clay.type !== "clay" || clay.state !== "dug") {
            showStatus("Carry some dug clay to wedge it");
            return null;
        }
        return clay;
    },

    startWedge: function() {
        if (this.clayToWedge()) {
            showStatus("Wedging, keep holding");
            this.wedgeSound = WEDGE_SOUNDS[this.clayToWedge().clay.name];
            audioController.loopSfx(this.wedgeSound);
            this.delay(this.finishWedge, WEDGE_MS);
        }
    },

    cancelWedge: function() {
        this.cancelDelay(this.finishWedge);
        this.stopWedgeSound();
    },

    stopWedgeSound: function() {
        if (this.wedgeSound) {
            audioController.stopSfx(this.wedgeSound);
            this.wedgeSound = null;
        }
    },

    // The fox may have walked off or changed clay mid-hold; check again.
    finishWedge: function() {
        this.stopWedgeSound();
        var clay = this.clayToWedge();
        if (!clay) {
            return;
        }
        this.touchingFox().inventory.take();
        clay.advance("wedged");
        var pile = this.pileClay(clay.clay.name);
        if (pile) {
            pile.clay.weight += clay.clay.weight;
            this.pile.changed();
        } else {
            this.pile.add(clay);
        }
        showStatus("Wedged one kilo of " + clay.clay.name + " clay onto the bench (" + this.pileClay(clay.clay.name).clay.weight + " g)");
    },

    // Gives the fox `grams` of the named clay's pile as weighed clay. Returns false (and changes nothing) if it can't.
    weigh: function(name, grams) {
        var fox = this.touchingFox();
        var pile = this.pileClay(name);
        if (!fox || !pile) {
            return false;
        }
        var piece = pile.weighOut(grams);
        if (!piece) {
            showStatus("There are only " + pile.clay.weight + " g on the bench");
            return false;
        }
        if (!fox.pickUp(piece)) {
            pile.clay.weight += grams;
            return false;
        }
        if (pile.clay.weight === 0) {
            this.pile.take(this.pile.items.indexOf(pile));
        } else {
            this.pile.changed();
        }
        showStatus("Weighed out " + grams + " g of " + piece.clay.name + " clay");
        return true;
    }
});
