// The workbench: a zone square inside the house with two parts, used while the fox touches it.
// - The bench itself: hold the mouse on it for WEDGE_MS with weighed clay selected to wedge it (it stays
//   in the pack, now "wedged"). Clay is weighed first, at the WeighingStation.
// - Models (right): one per ORDER_SHAPES; click one to carry it to the owl. It comes
//   back to its spot on "ModelReturned".
//   Crafty.e("Workbench").place(INSIDE_X + 600, 560, 520, 200);
Crafty.c("Workbench", {
    init: function() {
        this.requires("2D, DOM, Color, Mouse, Delay, Collision");
        this.color(WORKBENCH_COLOR);
        this.parts = [];
        this.modelSpots = [];
        this.bind("MouseDown", this.startWedge);
        this.bind("MouseUp", this.cancelWedge);
        this.bind("MouseOut", this.cancelWedge);
        this.bind("ModelReturned", this.returnModel);
        this.bind("Remove", function () {
            this.parts.forEach(function (part) { part.destroy(); });
        });
    },

    // Parts are laid out from the bench's position, so they are made here rather than in init.
    place: function(x, y, w, h) {
        this.attr({x: x, y: y, w: w, h: h});
        ORDER_SHAPES.forEach(function (shape, col) {
            this.addModelSpot({type: "model", shape: shape}, x + 320 + col * 66, y + 10);
        }, this);
        return this;
    },

    addModelSpot: function(model, x, y) {
        var bench = this;
        var spot = Crafty.e("2D, DOM, Color, Text, Mouse")
            .attr({x: x, y: y, w: 62, h: 56, z: this.z + 1})
            .text(model.shape)
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
            showStatus("Picked up the " + spot.model.shape + " model");
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

    touchingFox: function() {
        var hits = this.hit("Fox");
        return hits ? hits[0].obj : null;
    },

    // Weighed clay the fox has selected that may be wedged, or null (with a status saying why).
    clayToWedge: function() {
        var fox = this.touchingFox();
        if (!fox) {
            showStatus("Walk up to the workbench first");
            return null;
        }
        var clay = fox.inventory.selectedItem();
        if (!clay || clay.type !== "clay") {
            showStatus("Carry some weighed clay to wedge it");
        } else if (clay.state === "dug") {
            showStatus("Weigh the clay at the weighing station first");
        } else if (clay.state === "wedged") {
            showStatus("That clay is already wedged");
        } else {
            return clay;
        }
        return null;
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
        clay.advance("wedged");
        this.touchingFox().inventory.changed();
        showStatus("Wedged " + clay.clay.weight + " g of " + clay.clay.name + " clay, now pick a model");
    }
});
