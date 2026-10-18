// The player: sprite, arrow-key movement, and an Inventory of FOX_INVENTORY_CAPACITY items of any
// kind in any mix (2 dug clays, weighed clay and a model, 2 pots, a pot and a model...).
// Each 1000 g of clay carried slows the fox by FOX_SLOWDOWN_PER_KG of its base speed.
// E steps through the slots; SPACE drops the selected item (a dropped model goes back to the bench).
//   var player = Crafty.e("Fox").attr({x: 920, y: 820});
Crafty.c("Fox", {
    init: function() {
        this.requires("2D, DOM, fox, Fourway, Collision, Keyboard");
        this.attr({w: 160, h: 102});
        this.fourway(FOX_SPEED);
        this.inventory = new Inventory(FOX_INVENTORY_CAPACITY, {fits: function () { return true; }});
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.updateSpeed();
            }
        });
        this.bind("KeyDown", this.onKeyDown);
    },

    updateSpeed: function() {
        var grams = this.inventory.items.reduce(function (sum, item) {
            return sum + (item.type === "clay" ? item.clay.weight : 0);
        }, 0);
        var speed = FOX_SPEED * (1 - FOX_SLOWDOWN_PER_KG * grams / 1000);
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

    // Dropped clay and pots just disappear; a model goes back to its spot on the bench.
    dropSelected: function() {
        var dropped = this.inventory.take();
        if (!dropped) {
            showStatus("Nothing to drop");
            return;
        }
        if (dropped.type === "model") {
            Crafty.trigger("ModelReturned", dropped);
            showStatus("Put the model back on the bench");
            return;
        }
        showStatus(dropped.type === "clay" ? "Dropped " + dropped.clay.weight + " g of " + dropped.clay.name + " clay" : "Dropped the pot");
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
