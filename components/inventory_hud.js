// HUD strip showing an inventory: one box per slot, filled with the item's colour,
// the selected slot outlined in white. Redraws whenever that inventory changes.
//   Crafty.e("InventoryHud").attr({x: 20, y: 60}).show(player.inventory);
Crafty.c("InventoryHud", {
    init: function() {
        this.requires("2D");
        this.slots = [];
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.refresh();
            }
        });
        this.bind("Remove", function () {
            this.slots.forEach(function (slot) { slot.destroy(); });
        });
    },

    // Call after positioning with attr.
    show: function(inventory) {
        this.inventory = inventory;
        for (var i = 0; i < inventory.capacity; i++) {
            this.slots.push(Crafty.e("2D, HUD, Color")
                .attr({x: this.x + i * 50, y: this.y, w: 40, h: 40, z: 1000}));
        }
        return this.refresh();
    },

    refresh: function() {
        this.slots.forEach(function (slot, i) {
            var item = this.inventory.items[i];
            slot.color(item ? itemColor(item) : '#DDD');
            slot.css({boxSizing: 'border-box',
                border: item && i === this.inventory.selected ? '3px solid #FFF' : '3px solid #222'});
        }, this);
        return this;
    }
});
