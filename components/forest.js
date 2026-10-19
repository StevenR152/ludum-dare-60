// A tree: an invisible zone Outside (the forest zone is cut into one per tree). Hold the mouse on it for
// LOG_CHOP_MS while the fox touches it to chop a log into the fox's pack, then keeps chopping another log every
// LOG_CHOP_MS for as long as the press is held. Chopping stops on release, when the fox walks off, or when the
// pack is full. Trees never run out.
// `plant` draws its picture standing at the bottom middle of the zone.
//   Crafty.e("Forest").attr({x: 5, y: 350, w: 105, h: 307}).plant(FOREST_TREES[0]);
Crafty.c("Forest", {
    init: function() {
        this.requires("2D, DOM, Mouse, Delay, Collision, DebugHitbox");
        this.chopping = false;
        this.bind("MouseDown", this.startChop);
        // A real release says the chop stopped; the cursor merely leaving the tree stops it quietly.
        this.bind("MouseUp", function () { this.stopChop(true); });
        this.bind("MouseOut", function () { this.stopChop(false); });
    },

    plant: function(tree) {
        var art = Crafty.e("2D, DOM, " + tree.sprite);
        var w = tree.content[2] * TREE_SCALE;
        var h = tree.content[3] * TREE_SCALE;
        fitArt(art, tree.content, {x: this.x + (this.w - w) / 2 + tree.dx, y: this.y + this.h - h + tree.dy, w: w, h: h});
        this.bind("Remove", function () { art.destroy(); });
        return this;
    },

    touchingFox: function() {
        var hits = this.hit("Fox");
        return hits ? hits[0].obj : null;
    },

    startChop: function() {
        if (!this.touchingFox()) {
            showStatus("I can't reach the forest from here");
            return;
        }
        showStatus("Chopping, keep holding");
        this.chopping = true;
        Crafty.trigger("HoldStarted", {ms: LOG_CHOP_MS});
        this.delay(this.finishChop, LOG_CHOP_MS, -1);   // -1 repeats until stopChop
    },

    // Ends a chop in progress. `spoken` true (a real release) also says so; a stray MouseOut and the paths
    // that have already explained themselves (a full pack, the fox out of reach) stop it silently.
    stopChop: function(spoken) {
        this.cancelDelay(this.finishChop);
        if (!this.chopping) {
            return;
        }
        this.chopping = false;
        Crafty.trigger("HoldEnded");
        if (spoken) {
            showStatus("You stopped chopping");
        }
    },

    // Runs every LOG_CHOP_MS while held. The fox may have walked off mid-hold; pickUp explains a full or mixed pack.
    finishChop: function() {
        var fox = this.touchingFox();
        if (!fox || !fox.pickUp({type: "log"})) {
            this.stopChop(false);
            return;
        }
        showStatus("Chopped a log");
        Crafty.trigger("LogChopped");
        if (!fox.inventory.canAdd({type: "log"})) {
            // packFull() says its own line and flashes the pack, so the chop stops quietly; the return
            // matters, or the bar below would start filling again for a log there is no room for.
            this.stopChop(false);
            fox.packFull();
            return;
        }
        // Still holding and still room: the bar starts again for the next log.
        Crafty.trigger("HoldStarted", {ms: LOG_CHOP_MS});
    }
});
