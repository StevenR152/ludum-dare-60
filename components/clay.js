// Hold for CLAY_DIG_MS to dig; the pile greys out and triggers "ClayDug" with its
// type, then respawns (own colour, diggable again) after CLAY_RESPAWN_MS.
//   Crafty.e("Clay").attr({x: 195, y: 775, w: 80, h: 80}).clay(CLAY_TYPES.brown);
Crafty.c("Clay", {
    init: function() {
        this.requires("2D, DOM, Color, Mouse, Delay, Collision");
        this.clayType = null;
        this.dug = false;
        this.bind("MouseDown", this.startDig);
        this.bind("MouseUp", this.cancelDig);
        this.bind("MouseOut", this.cancelDig);

    },

//clay should have colour, change colour square when dug
    clay: function(type) {
        this.clayType = type;
        return this.color(type.color); },

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
    // The fox may have walked off mid-hold, or have a full backpack.
    dig: function() {
        var fox = this.touchingFox();
        if (!fox) {
            showStatus("Can't harvest clay without moving fox to spot");
            return;
        }
        if (!fox.addClay(this.clayType)) {
            return;
        }
        this.dug = true;
        this.color(CLAY_DUG_COLOR);
        this.trigger("ClayDug", this.clayType);
        this.delay(this.respawn, CLAY_RESPAWN_MS);
    },

    // Pile reappears so the same spot can be re-harvested.
    respawn: function() {
        this.dug = false;
        this.color(this.clayType.color);
    }
});
