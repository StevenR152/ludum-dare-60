// The player: sprite, arrow-key movement, and an Inventory of FOX_INVENTORY_CAPACITY items of any
// kind in any mix (2 dug clays, weighed clay and a model, 2 pots, a pot and a model...).
// Each 1000 g of clay carried slows the fox by FOX_SLOWDOWN_PER_KG of its base speed, and every dropped
// item it overlaps multiplies its speed by DROPPED_ITEM_SLOWDOWN (see DroppedItem).
// E steps through the slots; SPACE drops the selected item on the ground. A moving fox carrying something
// may also stumble and drop a random item; the more it is slowed, the likelier.
//   var player = Crafty.e("Fox").attr({x: 920, y: 820});
Crafty.c("Fox", {
    init: function() {
        this.requires("2D, DOM, fox, Fourway, Collision, Keyboard");
        this.attr({w: 160, h: 102});
        this.fourway(FOX_SPEED);
        this.slowFraction = 0;
        this.inventory = new Inventory(FOX_INVENTORY_CAPACITY, {fits: function () { return true; }});
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.updateSpeed();
            }
        });
        this.bind("DroppedOverlapChanged", this.updateSpeed);
        this.bind("KeyDown", this.onKeyDown);
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
            this.dropSelected();
        }
    },

    selectNext: function() {
        if (this.inventory.items.length === 0) {
            showStatus("Nothing to choose, you're carrying nothing");
            return;
        }
        this.inventory.selectNext();
    },

    // The selected item lands on the ground at the fox's feet.
    dropSelected: function() {
        var dropped = this.inventory.take();
        if (!dropped) {
            showStatus("Nothing to drop");
            return;
        }
        this.dropItem(dropped);
        showStatus(dropped.type === "clay" ? "Dropped " + dropped.clay.weight + " g of " + dropped.clay.name + " clay" : "Dropped the " + dropped.type);
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
