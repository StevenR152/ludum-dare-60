// Maps game events to sounds so gameplay code never plays audio itself. One lives in the Game scene
// (so its listeners go with the scene) and calls audioController, which owns playback and mute.
//   Crafty.e("GameSounds").listen(player, kiln);
// - Ambient: the Workshop loop while the fox is Inside (x < 0), the Forest loop Outside.
// - "ItemMoved" {item, from, to} (transferItem, SPACE drop): a pot entering the fox's pack is a pickup, one
//   leaving it a putdown, by stage and clay; a pot into the kiln is a putdown too.
// - "PotterWorking" / "PotterDone": the kick wheel loops while the owl works, then his pot's putdown sound.
// - "KilnLit": the fire catching (the kiln's start-firing sound).
// - "PotGlazed": first dip vs later dips. "PotCracked": one crack sound for every cracked pot ("PotDestroyed" too).
// - "Stumbled": the fox tripped and dropped something.
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
        this.bind("KilnLit", function () { audioController.playSfx("kilnLit"); });
        this.bind("PotCracked", function () { audioController.playSfx("potCrack"); });
        this.bind("PotDestroyed", function () { audioController.playSfx("potCrack"); });
        this.bind("Stumbled", function () { audioController.playSfx("stumble"); });
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
            audioController.playMusic(area, AMBIENT_VOLUME);
        }
    },

    onItemMoved: function(move) {
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
