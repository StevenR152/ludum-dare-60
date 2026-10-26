// Hold for CLAY_DIG_MS to dig; the patch fades to CLAY_DUG_ALPHA and triggers "ClayDug" with its
// type (a global event, so the Goal panel can hear it), then respawns (fully opaque, diggable again) after CLAY_RESPAWN_MS.
//   Crafty.e("Clay").clay(CLAY_TYPES.black);
Crafty.c("Clay", {
    init: function() {
        this.requires("2D, DOM, Mouse, Delay, Collision, DebugHitbox");
        this.clayType = null;
        this.dug = false;
        this.digging = false;
        // Digging is a hold, which only starts from a press begun on the patch (Fox.arrive).
        this.startsOnlyInReach = true;
        this.arrivalHint = "Hold on the clay to dig it";
        this.bind("MouseDown", this.startDig);
        // A real release says the dig stopped; the cursor merely leaving the patch stops it quietly.
        this.bind("MouseUp", function () { this.stopDig(true); });
        this.bind("MouseOut", function () { this.stopDig(false); });

    },

    // The patch picture covers the whole map (moved by `shift`, world px) and shows while the clay can be
    // dug. The dig zone is the lower, central part of the patch's drawing, where the fox stands.
    clay: function(type, shift) {
        shift = shift || {x: 0, y: 0};
        this.clayType = type;
        var patch = Crafty.e("2D, DOM, " + type.patch)
            .attr({x: OUTSIDE_MAP_BOX.x + shift.x, y: OUTSIDE_MAP_BOX.y + shift.y,
                   w: OUTSIDE_MAP_BOX.w, h: OUTSIDE_MAP_BOX.h, z: OUTSIDE_ART_Z})
            .css({transition: "opacity 1s"});
        this.patch = patch;
        var sx = OUTSIDE_MAP_BOX.w / OUTSIDE_MAP_PX.w;
        var sy = OUTSIDE_MAP_BOX.h / OUTSIDE_MAP_PX.h;
        var c = type.patchContent;
        var art = {x: patch.x + c[0] * sx, y: patch.y + c[1] * sy, w: c[2] * sx, h: c[3] * sy};
        // The mask follows the whole picture (art); the box that is pressed and touched may be smaller.
        this.art = art;
        var scale = type.digZoneScale || 1;
        this.attr({x: art.x + art.w * (1 - scale) / 2, y: art.y + art.h * (1 - scale) / 2,
                   w: art.w * scale, h: art.h * scale});
        this.loadMask(type.patchUrl, c, art);
        this.bind("Remove", function () { patch.destroy(); });
        return this;
    },

    // Reads the opaque part of the patch picture into one flag per world px of the box (alpha >= COLLISION_ALPHA),
    // so a press on transparent art inside the box is ignored. The picture is only read, never changed.
    loadMask: function(url, content, art) {
        var image = url ? Crafty.asset(url) : null;
        if (!image) {
            console.error("Clay patch picture not loaded: " + url + " (the whole box can be pressed)");
            return;
        }
        var cols = Math.max(1, Math.round(art.w));
        var rows = Math.max(1, Math.round(art.h));
        var canvas = document.createElement("canvas");
        canvas.width = cols;
        canvas.height = rows;
        var context = canvas.getContext("2d");
        context.drawImage(image, content[0], content[1], content[2], content[3], 0, 0, cols, rows);
        var rgba = context.getImageData(0, 0, cols, rows).data;
        var solid = new Uint8Array(cols * rows);
        for (var i = 0; i < solid.length; i++) {
            solid[i] = rgba[i * 4 + 3] >= COLLISION_ALPHA ? 1 : 0;
        }
        this.mask = {cols: cols, rows: rows, solid: solid};
    },

    // True if the world point is on visible clay (or no mask or point is known).
    isClayAt: function(wx, wy) {
        if (!this.mask || wx === undefined || wy === undefined) {
            return true;
        }
        var col = Math.floor((wx - this.art.x) * this.mask.cols / this.art.w);
        var row = Math.floor((wy - this.art.y) * this.mask.rows / this.art.h);
        if (col < 0 || row < 0 || col >= this.mask.cols || row >= this.mask.rows) {
            return false;
        }
        return this.mask.solid[row * this.mask.cols + col] === 1;
    },

        //can only dig if pile not dug - ?could we run out of clay in future
    // Only the fox standing on the pile can dig it.
    startDig: function(e) {
        if (!this.isClayAt(e && e.realX, e && e.realY)) {
            return;
        }
        if (this.dug) {
            showStatus("Give the land a break, you can't harvest clay within 20 seconds of a first harvest");
            return;
        }
        if (!this.touchingFox()) {
            showStatus("I can't harvest the clay from here");
            return;
        }
        this.digging = true;
        showStatus("Digging clay...");
        Crafty.trigger("HoldStarted", {ms: CLAY_DIG_MS});
        this.delay(this.dig, CLAY_DIG_MS);
    },

    touchingFox: function() {
        var hits = this.hit("Fox");
        return hits ? hits[0].obj : null;
    },

    // Ends a dig in progress. `spoken` true (a real release) also says so; leaving the patch with the
    // cursor stops it silently, so a stray MouseOut never pops a message mid-dig.
    stopDig: function(spoken) {
        this.cancelDelay(this.dig);
        if (!this.digging) {
            return;
        }
        this.digging = false;
        Crafty.trigger("HoldEnded");
        if (spoken) {
            showStatus("You stopped digging");
        }
    },
    // The fox may have walked off mid-hold, or have no room.
    dig: function() {
        this.digging = false;
        Crafty.trigger("HoldEnded");
        var fox = this.touchingFox();
        if (!fox) {
            showStatus("I can't harvest the clay from here");
            return;
        }
        // Each kilo is its own Pottery, so wedging it never changes the shared clay type.
        if (!fox.pickUp(new Pottery(this.clayType))) {
            return;
        }
        showStatus("Dug up " + this.clayType.name + " clay");
        this.dug = true;
        this.patch.alpha = CLAY_DUG_ALPHA;
        Crafty.trigger("ClayDug", this.clayType);
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
        this.patch.alpha = 1;
    }
});
