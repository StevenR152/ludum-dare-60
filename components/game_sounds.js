// Maps game events to sounds so gameplay code never plays audio itself. One lives in the Game scene
// (so its listeners go with the scene) and calls audioController, which owns playback and mute.
//   Crafty.e("GameSounds").listen(player, kiln);
// - Ambient: the Workshop loop while the fox is Inside (x < 0), the Forest loop Outside.
// - "ItemMoved" {item, from, to} (transferItem, SPACE drop): a pot entering the fox's pack is a pickup, one
//   leaving it a putdown, by stage and clay; a pot into the kiln is a putdown too.
// - "PotterWorking" / "PotterDone": the kick wheel loops while the owl works, then his pot's putdown sound.
// - "KilnLit": the fire catching (the kiln's start-firing sound).
// - "PotGlazed": first dip vs later dips.
// - "OrderDelivered" / "OrderExpired": the success sound / the failed sound. "LevelFinished": the last order's
//   jingle gives way to the level-complete one.
// - "Stumbled": a quiet yelp from the fox (the dropped item makes its own landing sound).
// - "ItemMoved" also covers clay (wet pickup/putdown by colour) and a log landing in the kiln or on the ground.
// - "PotCracked" by the pot's size (CRACK_SOUNDS); "PotDestroyed" always the big crack.
// A dipped pot is still bisque ware until it leaves the glaze firing.
Crafty.c("GameSounds", {
    init: function() {
        this.area = null;
        this.bind("ItemMoved", this.onItemMoved);
        this.bind("PotGlazed", function (pot) {
            audioController.playSfx(pot.pot.glaze.length > 1 ? "glazeDipNext" : "glazeDipFirst");
        });
        // The owl's kick wheel loops while he throws or trims, then he puts the pot down.
        this.bind("PotterWorking", function () { audioController.loopSfx("kickWheel"); });
        this.bind("PotterDone", function (pot) {
            audioController.stopSfx("kickWheel");
            audioController.playSfx(this.potSound("putdown", pot));
        });
        this.levelFinished = false;
        // Skipped for the level's last order: its "LevelFinished" (below) is heard first and plays the
        // level-complete jingle, so the order one would only play over it.
        this.bind("OrderDelivered", function () {
            if (!this.levelFinished) {
                audioController.playSfx("orderDelivered");
            }
        });
        this.bind("OrderExpired", function () { audioController.playSfx("orderFailed"); });
        this.bind("KilnLit", function () {
            audioController.playSfx("kilnLit");
            audioController.loopSfx("fireLoop");
        });
        // The fire dies down as the kiln starts cooling, whether or not it holds a pot.
        this.bind("KilnCooling", function () { audioController.stopSfx("fireLoop"); });
        this.bind("ClayDug", function () { audioController.playSfx("digClay"); });
        this.bind("ClayWeighed", function () { audioController.playSfx("weighScale"); });
        this.bind("LogChopped", function () { audioController.playSfx("chopLog"); });
        this.bind("DoorUsed", function () { audioController.playSfx("door"); });
        // Loops outlive the scene, so end them with it.
        this.bind("Remove", function () {
            audioController.stopSfx("kickWheel");
            audioController.stopSfx("fireLoop");
        });
        // A crack by the size of the pot (CRACK_SOUNDS); a pot broken for good is always the big one.
        this.bind("PotCracked", function (pot) {
            audioController.playSfx(pot && pot.pot && CRACK_SOUNDS[pot.pot.shape] || "potCrack");
        });
        this.bind("PotDestroyed", function () { audioController.playSfx("potCrack"); });
        // A quiet yelp; the dropped item makes its own sound as it lands (onItemMoved).
        this.bind("Stumbled", function () {
            audioController.playSfx(Math.random() < 0.5 ? "foxYelp1" : "foxYelp2", STUMBLE_YELP_VOLUME);
        });
        // The level's last order: its closing jingle takes over from the ordinary order one. The level's own
        // OrderDelivered handler fires this before ours sees the order, so flag it to skip the order jingle; the
        // stop covers the other order, should the order jingle already be playing.
        this.bind("LevelFinished", function () {
            this.levelFinished = true;
            audioController.stopSfx("orderDelivered");
            audioController.playSfx("levelComplete");
        });
        this.bind("UpdateFrame", this.updateAmbient);
    },

    listen: function(fox, kiln) {
        this.fox = fox;
        this.kiln = kiln;
        this.updateAmbient();
        return this;
    },

    updateAmbient: function() {
        var area = this.fox.x < 0 ? "workshopLoop" : "forestLoop";
        if (area !== this.area) {
            this.area = area;
            audioController.playAmbient(area, AMBIENT_VOLUME);
        }
    },

    onItemMoved: function(move) {
        // A log lands with a thunk, into the kiln or on the ground (dropped, or lost in a stumble).
        if (move.item.type === "log" && (move.to === this.kiln.woodInventory || (move.to === null && move.from === this.fox.inventory))) {
            audioController.playSfx("dropLog");
        }
        // Clay sounds wet whichever form it is in (a dug kilo, a weighed piece, wedged): picked up into the pack,
        // put down out of it (on the scales, handed to the owl, dropped, given back to its patch), by clay colour.
        if (move.item.type === "clay") {
            if (move.to === this.fox.inventory) {
                audioController.playSfx("pickupWet" + WET_POT_SOUND_SUFFIX[move.item.clay.name]);
            } else if (move.from === this.fox.inventory) {
                audioController.playSfx("putdownWet" + WET_POT_SOUND_SUFFIX[move.item.clay.name]);
            }
            return;
        }
        if (move.item.type !== "pot") {
            return;
        }
        if (move.to === this.kiln.inventory) {
            audioController.playSfx(this.potSound("putdown", move.item));
        } else if (move.to === this.fox.inventory) {
            audioController.playSfx(this.potSound("pickup", move.item));
        } else if (move.from === this.fox.inventory) {
            audioController.playSfx(this.potSound("putdown", move.item));
        }
    },

    // "pickup" or "putdown" plus the pot's stage; a wet or leather hard pot also by clay.
    potSound: function(action, pot) {
        if (pot.state === "glazeCooled") {
            return action + "Glazed";
        }
        if (pot.state !== "thrown") {
            return action + "Bisque";
        }
        return pot.pot.dryness >= 1 ? action + "BoneDry" : action + "Wet" + WET_POT_SOUND_SUFFIX[pot.clay.name];
    }
});
