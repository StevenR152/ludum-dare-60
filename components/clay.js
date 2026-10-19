// Hold for CLAY_DIG_MS to dig; the pile greys out and triggers "ClayDug" with its
// type, then respawns (own colour, diggable again) after CLAY_RESPAWN_MS.
//   Crafty.e("Clay").attr({x: 195, y: 775, w: 80, h: 80}).clay(CLAY_TYPES.black);
Crafty.c("Clay", {
    init: function() {
        this.requires("2D, DOM, Mouse, Delay, Collision, DebugHitbox");
        this.clayType = null;
        this.dug = false;
        this.bind("MouseDown", this.startDig);
        this.bind("MouseUp", this.cancelDig);
        this.bind("MouseOut", this.cancelDig);

    },

    // The patch picture covers the whole map and shows while the clay can be dug.
    clay: function(type) {
        this.clayType = type;
        var patch = Crafty.e("2D, DOM, " + type.patch).attr(OUTSIDE_MAP_BOX).attr({z: OUTSIDE_ART_Z});
        this.patch = patch;
        this.bind("Remove", function () { patch.destroy(); });
        return this;
    },

        //can only dig if pile not dug - ?could we run out of clay in future
    // Only the fox standing on the pile can dig it.
    startDig: function() {
        if (this.dug) {
            showStatus("Give the land a break, you can't harvest clay within 20 seconds of a first harvest");
            return;
        }
        if (!this.touchingFox()) {
            showStatus("Can't harvest clay without moving fox to spot");
            return;
        }
        this.delay(this.dig, CLAY_DIG_MS);
    },

    touchingFox: function() {
        var hits = this.hit("Fox");
        return hits ? hits[0].obj : null;
    },

    cancelDig: function() { this.cancelDelay(this.dig); },
    // The fox may have walked off mid-hold, or have no room.
    dig: function() {
        var fox = this.touchingFox();
        if (!fox) {
            showStatus("Can't harvest clay without moving fox to spot");
            return;
        }
        // Each kilo is its own Pottery, so wedging it never changes the shared clay type.
        if (!fox.pickUp(new Pottery(this.clayType))) {
            return;
        }
        this.dug = true;
        this.patch.visible = false;
        this.trigger("ClayDug", this.clayType);
        this.respawnDue = Date.now() + CLAY_RESPAWN_MS;
        this.delay(this.respawn, CLAY_RESPAWN_MS);
    },

    // Clay of this node's colour dropped on it while it is dug (dug, wedged, weighed, or a thrown unfired
    // pot of it) is used up and takes CLAY_REFILL_PERCENT of CLAY_RESPAWN_MS off the respawn (the fox's
    // offerToStations). Returns false, changing nothing, for anything else.
    acceptDrop: function(item) {
        var usable = item.type === "pot" ? item.state === "thrown" : ["dug", "wedged", "weighed"].indexOf(item.state) >= 0;
        if (!this.dug || !item.clay || item.clay.name !== this.clayType.name || !usable) {
            return false;
        }
        this.cancelDelay(this.respawn);
        var left = this.respawnDue - Date.now() - CLAY_RESPAWN_MS * CLAY_REFILL_PERCENT;
        if (left <= 0) {
            this.respawn();
            showStatus("The " + this.clayType.name + " clay patch is full again");
        } else {
            this.respawnDue = Date.now() + left;
            this.delay(this.respawn, left);
            showStatus("The " + this.clayType.name + " clay patch will be ready in " + Math.ceil(left / 1000) + " s");
        }
        return true;
    },

    // Pile reappears so the same spot can be re-harvested.
    respawn: function() {
        this.dug = false;
        this.patch.visible = true;
    }
});
