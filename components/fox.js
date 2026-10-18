// The player: sprite, arrow-key movement, and an Inventory of FOX_INVENTORY_CAPACITY items
// of one type at a time (clay or pots). Each kg of clay carried slows the fox by
// FOX_SLOWDOWN_PER_KG of its base speed.
// E steps through the slots; SPACE drops the selected item.
//   var player = Crafty.e("Fox").attr({x: 920, y: 820});
Crafty.c("Fox", {
    init: function() {
        this.requires("2D, DOM, fox, Fourway, Collision, Keyboard");
        this.attr({w: 160, h: 102});
        this.fourway(FOX_SPEED);
        this.inventory = new Inventory(FOX_INVENTORY_CAPACITY);
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.updateSpeed();
            }
        });
        this.bind("KeyDown", this.onKeyDown);
    },

    updateSpeed: function() {
        var items = this.inventory.items;
        var kilos = items.length > 0 && items[0].type === "clay" ? items.length : 0;
        var speed = FOX_SPEED * (1 - FOX_SLOWDOWN_PER_KG * kilos);
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

    // Dropped items just disappear.
    dropSelected: function() {
        var dropped = this.inventory.take();
        if (!dropped) {
            showStatus("Nothing to drop");
            return;
        }
        showStatus(dropped.type === "clay" ? "Dropped one kilo of " + dropped.name + " clay" : "Dropped the pot");
    },

    // Returns false (and changes nothing) when the item doesn't fit.
    pickUp: function(item) {
        if (this.inventory.add(item)) {
            return true;
        }
        showStatus(this.inventory.items.length >= this.inventory.capacity
            ? "Backpack full, you can't put more in"
            : "You can only carry one kind of thing at a time");
        return false;
    }
});
