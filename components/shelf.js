// Base for the inside shelves: an invisible but clickable zone square that owns an Inventory and draws one
// box per slot (the item's colour or picture, nothing when empty). Components built on it call
// holdItems(capacity, rules) from init; the Inventory rules decide what goes on and what comes off.
//   transferItem(fox.inventory, shelf.inventory);
Crafty.c("Shelf", {
    init: function() {
        this.requires("2D, DOM, Color, Mouse, DebugHitbox");
        this.color("#FFF", 0);   // the zone is clickable but not drawn: the art shows the shelf
        this.slotBoxes = [];
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.drawSlots();
            }
        });
        this.bind("Remove", function () {
            this.slotBoxes.forEach(function (box) { box.destroy(); });
        });
    },

    holdItems: function(capacity, rules) {
        this.inventory = new Inventory(capacity, rules);
        return this;
    },

    // Slots sit SHELF_SLOT_TOP below the top of the shelf box, whatever its height.
    slotTop: function() {
        return this.y + SHELF_SLOT_TOP;
    },

    // Positioned now, not in init, because the shelf's position is set after init.
    drawSlots: function() {
        for (var i = 0; i < this.inventory.capacity; i++) {
            if (!this.slotBoxes[i]) {
                this.slotBoxes[i] = Crafty.e("2D, DOM, Color").attr({w: 40, h: 40});
            }
            var item = this.inventory.items[i];
            this.slotBoxes[i]
                .attr({x: this.x + 20 + i * 60, y: this.slotTop(), z: this.z + 1})
                .color("#FFF", 0);   // an empty slot is not drawn; a pot paints itself over it
            paintItem(this.slotBoxes[i], item);
        }
        // For shelves that decorate the slots (the drying shelf's bars and click handlers).
        this.trigger("SlotsDrawn");
    },

    // Slot boxes appear once the shelf has been placed; call after attr().
    place: function(x, y, w, h) {
        this.attr({x: x, y: y, w: w, h: h});
        this.drawSlots();
        return this;
    }
});
