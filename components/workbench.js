// The workbench: a zone square inside the house with two parts, used while the fox touches it.
// - The bench itself: hold the mouse on it for WEDGE_MS with weighed clay selected to wedge it (it stays
//   in the pack, now "wedged"). Clay is weighed first, at the WeighingStation.
// - Models (left): one per ORDER_SHAPES; click one to carry it to the owl. Clicking again gives another
//   (so a lost model never blocks the player); the spot is lit again on "ModelReturned" of that shape.
//   Crafty.e("Workbench").place(-1850, 242, 260, 50);          // a model per shape
//   Crafty.e("Workbench").place(-1850, 242, 260, 50, ["Cup"]); // only these models
Crafty.c("Workbench", {
    init: function() {
        this.requires("2D, DOM, Mouse, Delay, Collision, DebugHitbox");
        this.parts = [];
        this.modelSpots = [];
        this.wedging = false;
        // Wedging is a hold, which only starts from a press begun at the bench (Fox.arrive).
        this.startsOnlyInReach = true;
        this.arrivalHint = "Hold on the bench to wedge the clay";
        this.bind("MouseDown", this.startWedge);
        // A real release says the wedging stopped; the cursor merely leaving the bench stops it quietly.
        this.bind("MouseUp", function () { this.stopWedge(true); });
        this.bind("MouseOut", function () { this.stopWedge(false); });
        this.bind("ModelReturned", this.returnModel);
        this.bind("Remove", function () {
            this.hideWedgedClay();
            this.parts.forEach(function (part) { part.destroy(); });
        });
    },

    // Parts are laid out from the bench's position, so they are made here rather than in init.
    place: function(x, y, w, h, shapes) {
        shapes = shapes || ORDER_SHAPES;
        this.attr({x: x, y: y, w: w, h: h});
        // One model spot per shape, side by side across the left half; the right half is bare bench to wedge on.
        var gap = 3;
        var spotW = (w / 2 - gap * (shapes.length + 1)) / shapes.length;
        shapes.forEach(function (shape, col) {
            this.addModelSpot({type: "model", shape: shape}, x + gap + col * (spotW + gap), y + gap - WORKBENCH_MODEL_LIFT, spotW, h - gap * 2);
        }, this);
        Crafty.e("Caption").caption("Wedging", x + WORKBENCH_CAPTION_SHIFT_X, y + h + WORKBENCH_CAPTION_GAP, w, INTERIOR_FRONT_Z + 1, this);
        // The zone reaches WORKBENCH_REACH further down than the bench is drawn, so the fox counts as at the bench sooner.
        this.h = h + WORKBENCH_REACH;
        return this;
    },

    addModelSpot: function(model, x, y, w, h) {
        var bench = this;
        var spot = Crafty.e("2D, DOM, Color, Mouse, DebugHitbox")
            .attr({x: x, y: y, w: w, h: h, z: this.z + 1});
        spot.model = model;
        spot.reachVia = bench; // click-to-move walks to the bench, not the model spot
        spot.actsOnArrival = true; // taking a model is one click, so a tap from afar fetches it (Fox.arrive)
        spot.home = true;
        spot.bind("MouseDown", function () { bench.takeModel(spot); });
        this.parts.push(spot);
        this.modelSpots.push(spot);
        this.drawModelSpot(spot);
    },

    drawModelSpot: function(spot) {
        paintItem(spot, spot.model);
        spot.css({opacity: spot.home ? 1 : 0.25});
    },

    takeModel: function(spot) {
        var fox = this.touchingFox();
        if (!fox) {
            showStatus("I can't reach the workbench from here");
        } else if (fox.pickUp({type: "model", shape: spot.model.shape})) {
            // A fresh model each time, so a lost one never leaves the player stuck.
            var again = !spot.home;
            spot.home = false;
            this.drawModelSpot(spot);
            showStatus("Picked up " + (again ? "another " : "the ") + spot.model.shape + " model");
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
            if (spot.model.shape === model.shape) {
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
            showStatus("I can't reach the workbench from here");
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
            this.wedging = true;
            this.showWedgedClay(this.clayToWedge().clay);
            Crafty.trigger("HoldStarted", {ms: WEDGE_MS});
            this.delay(this.finishWedge, WEDGE_MS);
        }
    },

    // Ends wedging in progress. `spoken` true (a real release) also says so; a stray MouseOut stops it
    // silently. A press that was refused never set the flag, so it says nothing either.
    stopWedge: function(spoken) {
        this.cancelDelay(this.finishWedge);
        this.stopWedgeSound();
        if (!this.wedging) {
            return;
        }
        this.wedging = false;
        this.hideWedgedClay();
        Crafty.trigger("HoldEnded");
        if (spoken) {
            showStatus("You stopped wedging");
        }
    },

    // The picture of the clay being wedged (by its letter), lying on the bench for as long as the hold lasts.
    showWedgedClay: function(clay) {
        var box = WEDGED_CLAY_BOX;
        var fit = fitPicture(box, WEDGED_CLAY_IMAGES[clay.letter]);
        this.wedgedPicture = Crafty.e("2D, DOM")
            .attr({x: this.x + box.x, y: this.y + box.y, w: box.w, h: box.h, z: this.z + 1})
            .css({backgroundImage: fit.layer, backgroundSize: fit.size, backgroundPosition: fit.position, backgroundRepeat: "no-repeat"});
    },

    hideWedgedClay: function() {
        if (this.wedgedPicture) {
            this.wedgedPicture.destroy();
            this.wedgedPicture = null;
        }
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
        this.wedging = false;
        this.hideWedgedClay();
        Crafty.trigger("HoldEnded");
        var clay = this.clayToWedge();
        if (!clay) {
            return;
        }
        clay.advance("wedged");
        this.touchingFox().inventory.changed();
        showStatus("Wedged " + clay.clay.weight + " g of " + clay.clay.name + " clay, now pick a model");
    }
});
