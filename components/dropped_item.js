// An item lying on the ground where the fox dropped it (SPACE, or a stumble). Any item can be dropped;
// it is drawn like its HUD box, DROPPED_ITEM_SCALE times bigger, and keeps its state (Fox.dropItem).
// - While the fox overlaps it the fox is slowed (see Fox.updateSpeed); several items multiply.
// - The first time the fox walks onto it, a pot may take damage (POT_BREAK_CHANCES by cook state). The
//   fox standing on a fresh drop doesn't count: it has to leave and come back. At BREAK_DAMAGE the pot
//   cracks, at DESTROY_DAMAGE it is gone. Clay, logs and models never take damage.
// - Click it while overlapping to pick it up again (Fox.pickUp).
// - It never lies out of bounds: a drop against a wall snaps to the closest clear spot (see collisionMap).
// Unfired pots keep drying at the off-shelf rate (see PotDrier).
//   Crafty.e("DroppedItem").dropFrom(fox, item);
Crafty.c("DroppedItem", {
    init: function() {
        this.requires("2D, DOM, Color, Mouse, Collision, DebugHitbox");
        this.item = null;
        this.fox = null;
        // True while the fox overlaps it; armed once the fox has left, so the next touch rolls damage.
        this.overlapping = false;
        this.armed = false;
        this.checkHits("Fox");
        this.bind("HitOn", this.onHitOn);
        this.bind("HitOff", this.onHitOff);
        this.bind("MouseDown", this.onClick);
        // A fresh drop starts overlapped, but Collision only reports HitOff after it has seen a HitOn, so
        // a fox that leaves (or is teleported) first would never clear it. Check directly too.
        this.bind("UpdateFrame", function () {
            if (this.overlapping && this.fox && !this.fox.touches(this)) {
                this.onHitOff();
            }
        });
        this.bind("PotsDried", this.redraw);
        this.bind("Remove", function () {
            if (this.overlapping) {
                this.overlapping = false;
                Crafty.trigger("DroppedOverlapChanged");
            }
        });
    },

    // Puts `item` on the ground at the fox's feet. The fox is standing on it, so no damage roll yet.
    dropFrom: function(fox, item) {
        var shape = ITEM_SHAPES[item.type];
        var w = shape.w * DROPPED_ITEM_SCALE;
        var h = shape.h * DROPPED_ITEM_SCALE;
        this.fox = fox;
        this.item = item;
        var x = fox.x + (fox.w - w) / 2;
        var y = fox.y + fox.h - h - 6;
        // Out of bounds (the fox is against a wall): the closest clear spot, else the middle of the fox's feet.
        if (collisionMap.isBoxBlocked(x, y, w, h)) {
            var spot = collisionMap.nearestFree(x, y, w, h);
            if (spot) {
                x = spot.x;
                y = spot.y;
            } else {
                x = fox.x + FOX_FEET_BOX.x + (FOX_FEET_BOX.w - w) / 2;
                y = fox.y + FOX_FEET_BOX.y + FOX_FEET_BOX.h - h;
            }
        }
        this.attr({x: x, y: y, w: w, h: h, z: DROPPED_ITEM_Z});
        this.overlapping = true;
        this.armed = false;
        this.redraw();
        Crafty.trigger("DroppedOverlapChanged");
        return this;
    },

    // Puts `item` on the ground with its middle at (cx, cy), the fox not on it: walking onto it later can roll damage.
    lieAt: function(fox, item, cx, cy) {
        var shape = ITEM_SHAPES[item.type];
        var w = shape.w * DROPPED_ITEM_SCALE;
        var h = shape.h * DROPPED_ITEM_SCALE;
        this.fox = fox;
        this.item = item;
        this.attr({x: cx - w / 2, y: cy - h / 2, w: w, h: h, z: DROPPED_ITEM_Z});
        this.overlapping = false;
        this.armed = true;
        this.redraw();
        return this;
    },

    redraw: function() {
        if (!this.item) {
            return;
        }
        paintItem(this, this.item);
        markBorder(this, this.item);
    },

    onHitOn: function() {
        this.overlapping = true;
        Crafty.trigger("DroppedOverlapChanged");
        if (this.armed) {
            this.armed = false;
            this.rollDamage();
        }
    },

    onHitOff: function() {
        this.overlapping = false;
        this.armed = true;
        Crafty.trigger("DroppedOverlapChanged");
    },

    // Pots only: POT_BREAK_CHANCES by cook state, a hit adds DAMAGE_PER_BREAK to pot.damage.
    rollDamage: function() {
        var pottery = this.item;
        if (!worldRules.potsBreakOnGround) {
            return;
        }
        var chance = POT_BREAK_CHANCES[pottery.state];
        if (pottery.type !== "pot" || !(Math.random() < chance)) {
            return;
        }
        pottery.pot.damage = (pottery.pot.damage || 0) + DAMAGE_PER_BREAK;
        if (pottery.pot.damage >= DESTROY_DAMAGE) {
            showStatus("The pot shattered");
            Crafty.trigger("PotDestroyed", pottery);
            this.destroy();
        } else if (pottery.pot.damage >= BREAK_DAMAGE && !pottery.pot.cracked) {
            pottery.pot.cracked = true;
            Crafty.trigger("PotCracked", pottery);
            showStatus("The pot cracked");
            this.redraw();
        } else {
            showStatus("The pot took another knock");
            this.redraw();
        }
    },

    // How the pickup line names the item.
    itemName: function() {
        var item = this.item;
        if (item.type === "clay") {
            return item.clay.weight + " g of " + item.clay.name + " clay";
        }
        return "the " + (item.type === "model" ? item.shape + " model" : item.type);
    },

    onClick: function() {
        if (!this.overlapping) {
            showStatus("I can't reach that from here");
        } else if (this.fox.pickUp(this.item)) {
            showStatus("Picked up " + this.itemName());
            Crafty.trigger("ItemMoved", {item: this.item, from: null, to: this.fox.inventory});
            this.destroy();
        }
    }
});
