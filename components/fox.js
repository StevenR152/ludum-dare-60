// The player: sprite, arrow-key movement, and an Inventory of FOX_INVENTORY_CAPACITY items of any
// kind in any mix (2 dug clays, wedged clay and a model, 2 pots, a pot and a model...).
// Each 1000 g of clay carried slows the fox by FOX_SLOWDOWN_PER_KG of its base speed, and every dropped
// item it overlaps multiplies its speed by DROPPED_ITEM_SLOWDOWN (see DroppedItem).
// E steps through the slots; SPACE acts like a click on what the fox touches (see pressAction); BACKSPACE puts
// the selected item back at the Workbench or Clay node the fox stands at if that takes it, else drops it on the
// ground. A moving fox carrying something may also stumble and
// drop a random item on the ground; the more it is slowed, the likelier.
//   var player = Crafty.e("Fox").attr({x: 512, y: 706});
Crafty.c("Fox", {
    init: function() {
        this.requires("2D, DOM, fox, Fourway, Collision, Keyboard");
        this.attr({w: 160, h: 102});
        // Touching uses the sprite box shrunk by FOX_HITBOX_INSET, not the transparent margins of the art.
        var inset = FOX_HITBOX_INSET;
        this.collision([inset, inset, this.w - inset, inset, this.w - inset, this.h - inset, inset, this.h - inset]);
        if (DEBUG_HITBOXES) {
            this.attach(Crafty.e("2D, DebugHitbox").attr({
                x: this.x + inset, y: this.y + inset, w: this.w - 2 * inset, h: this.h - 2 * inset, z: 1000
            }));
        }
        if (DEBUG_HITBOXES) {
            this.attach(Crafty.e("2D, DebugHitbox").attr({
                x: this.x + FOX_FEET_BOX.x, y: this.y + FOX_FEET_BOX.y, w: FOX_FEET_BOX.w, h: FOX_FEET_BOX.h, z: 1000
            }));
        }
        this.fourway(FOX_SPEED);
        // Out-of-bounds: every step is checked against the collision masks (see keepInBounds).
        this.teleporting = false;
        this.inBoundsFix = false;
        this.bind("Move", this.keepInBounds);
        this.slowFraction = 0;
        this.inventory = new Inventory(FOX_INVENTORY_CAPACITY, {fits: function () { return true; }});
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.updateSpeed();
            }
        });
        this.bind("DroppedOverlapChanged", this.updateSpeed);
        this.actionId = null;
        this.bind("KeyDown", this.onKeyDown);
        this.bind("KeyUp", this.onKeyUp);
        this.bind("UpdateFrame", this.maybeStumble);
        // The sprite faces right; mirror it while walking left, keep the last facing when stopped/vertical.
        this.bind("NewDirection", function (direction) {
            if (direction.x < 0) {
                this.flip("X");
            } else if (direction.x > 0) {
                this.unflip("X");
            }
        });
    },

    // True if the fox's feet, with the sprite box at (x, y), are on out-of-bounds ground.
    feetBlocked: function(x, y) {
        return collisionMap.isBoxBlocked(x + FOX_FEET_BOX.x, y + FOX_FEET_BOX.y, FOX_FEET_BOX.w, FOX_FEET_BOX.h);
    },

    // Runs after every position change (Crafty's "Move", with the old box). A step that would put the feet
    // out of bounds keeps whichever axis is still clear, so walking diagonally into a wall slides along it.
    // A fox already out of bounds (e.g. a bad spawn) may move freely, and teleportTo skips the check.
    keepInBounds: function(old) {
        if (this.teleporting || this.inBoundsFix || !this.feetBlocked(this.x, this.y) || this.feetBlocked(old._x, old._y)) {
            return;
        }
        var newX = this.x;
        var newY = this.y;
        this.inBoundsFix = true;
        if (!this.feetBlocked(newX, old._y)) {
            this.y = old._y;
        } else if (!this.feetBlocked(old._x, newY)) {
            this.x = old._x;
        } else {
            this.x = old._x;
            this.y = old._y;
        }
        this.inBoundsFix = false;
    },

    // Puts the fox at (x, y) whatever the masks say (doors; DOOR_DESTINATIONS should be clear anyway).
    teleportTo: function(x, y) {
        this.teleporting = true;
        this.attr({x: x, y: y});
        this.teleporting = false;
    },

    // True if the fox's touch area overlaps the entity's box.
    touches: function(entity) {
        var inset = FOX_HITBOX_INSET;
        return entity.intersect(this.x + inset, this.y + inset, this.w - 2 * inset, this.h - 2 * inset);
    },

    // Clay weight slows additively; each overlapped dropped item multiplies on top. slowFraction is how
    // much slower than FOX_SPEED the fox now is (0 to 1), which also raises the stumble chance.
    updateSpeed: function() {
        var grams = this.inventory.items.reduce(function (sum, item) {
            return sum + (item.type === "clay" ? item.clay.weight : 0);
        }, 0);
        var speed = FOX_SPEED * (1 - FOX_SLOWDOWN_PER_KG * grams / 1000);
        Crafty("DroppedItem").each(function () {
            if (this.overlapping) {
                speed *= DROPPED_ITEM_SLOWDOWN;
            }
        });
        this.slowFraction = Math.max(0, 1 - speed / FOX_SPEED);
        console.log("Speed changed to " + speed);
        this.speed({x: speed, y: speed});
    },

    onKeyDown: function(e) {
        if (e.key === Crafty.keys.E) {
            this.selectNext();
        } else if (e.key === Crafty.keys.SPACE) {
            this.pressAction();
        } else if (e.key === Crafty.keys.BACKSPACE) {
            this.dropSelected();
        }
    },

    onKeyUp: function(e) {
        if (e.key === Crafty.keys.SPACE) {
            this.releaseAction();
        }
    },

    // SPACE is a click on the world object the fox touches whose middle is nearest the fox's (the higher one
    // on a tie): its MouseDown now, its MouseUp when SPACE is let go, so hold actions (dig, wedge, chop) work.
    pressAction: function() {
        if (this.actionId !== null) {
            return; // key auto-repeat
        }
        var fox = this;
        var foxX = this.x + this.w / 2;
        var foxY = this.y + this.h / 2;
        var best = null;
        var bestDistance = Infinity;
        Crafty("Mouse").each(function () {
            if (this.has("HUD") || !fox.touches(this)) {
                return;
            }
            var distance = Math.pow(this.x + this.w / 2 - foxX, 2) + Math.pow(this.y + this.h / 2 - foxY, 2);
            if (distance < bestDistance || (distance === bestDistance && this.z > best.z)) {
                best = this;
                bestDistance = distance;
            }
        });
        if (best) {
            this.actionId = best[0];
            best.trigger("MouseDown");
        }
    },

    releaseAction: function() {
        if (this.actionId === null) {
            return;
        }
        // A target used up by the press (a picked-up dropped item) no longer exists.
        Crafty(this.actionId).trigger("MouseUp");
        this.actionId = null;
    },

    // A press on one of the fox's HUD slots (the phone way to choose and drop): an unselected item becomes
    // the selected one, the selected one is dropped. Empty slots do nothing.
    pressSlot: function(index) {
        if (!this.inventory.items[index]) {
            return;
        }
        if (index === this.inventory.selected) {
            this.dropSelected();
        } else {
            this.inventory.selected = index;
            this.inventory.changed();
        }
    },

    selectNext: function() {
        if (this.inventory.items.length === 0) {
            showStatus("Nothing to choose, you're carrying nothing");
            return;
        }
        this.inventory.selectNext();
    },

    // The selected item goes back to the station the fox stands at if it takes it (a model to the
    // workbench, clay to its clay node), otherwise it lands on the ground at the fox's feet.
    dropSelected: function() {
        var dropped = this.inventory.take();
        if (!dropped) {
            showStatus("Nothing to drop");
            return;
        }
        if (this.offerToStations(dropped)) {
            Crafty.trigger("ItemMoved", {item: dropped, from: this.inventory, to: null});
            return;
        }
        this.dropItem(dropped);
        showStatus(dropped.type === "clay" ? "Dropped " + dropped.clay.weight + " g of " + dropped.clay.name + " clay" : "Dropped the " + dropped.type);
    },

    // True if a Workbench or Clay node the fox overlaps took the item (their acceptDrop(item, fox)).
    // Stumbles skip this: a stumbled item always hits the ground.
    offerToStations: function(item) {
        var fox = this;
        var taken = false;
        ["Workbench", "Clay"].forEach(function (name) {
            Crafty(name).each(function () {
                if (!taken && fox.touches(this) && this.acceptDrop(item, fox)) {
                    taken = true;
                }
            });
        });
        return taken;
    },

    // Puts an item already out of the inventory on the ground.
    dropItem: function(item) {
        Crafty.trigger("ItemMoved", {item: item, from: this.inventory, to: null});
        Crafty.e("DroppedItem").dropFrom(this, item);
    },

    isMoving: function() {
        var velocity = this.velocity();
        return velocity.x !== 0 || velocity.y !== 0;
    },

    // Each frame a moving fox carrying something may stumble: STUMBLE_BASE_CHANCE per second, plus
    // STUMBLE_PER_SLOW times how slowed it is.
    maybeStumble: function(frame) {
        if (this.inventory.items.length === 0 || !this.isMoving()) {
            return;
        }
        var perSecond = STUMBLE_BASE_CHANCE + STUMBLE_PER_SLOW * this.slowFraction;
        if (Math.random() < perSecond * frame.dt / 1000) {
            this.stumble();
        }
    },

    // Drops a random carried item and plays the stumble sound.
    stumble: function() {
        var item = this.inventory.take(Math.floor(Math.random() * this.inventory.items.length));
        if (!item) {
            return;
        }
        this.dropItem(item);
        Crafty.trigger("Stumbled", item);
        showStatus("You stumbled and dropped something");
    },

    // Returns false (and changes nothing) when the item doesn't fit.
    pickUp: function(item) {
        if (this.inventory.add(item)) {
            return true;
        }
        showStatus("Backpack full, you can't put more in");
        return false;
    }
});
