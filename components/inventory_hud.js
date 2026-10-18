// One HUD row: a label, then a grey square per slot of each inventory given. An item in a slot is
// drawn centred in it in its own colour and shape (ITEM_SHAPES: clay square, pot thin).
// The selected slot of an inventory with more than one item is outlined in white.
// Redraws whenever one of its inventories changes.
//   Crafty.e("InventoryHud").attr({x: 20, y: 60}).show("Fox", [player.inventory]);
//   Crafty.e("InventoryHud").attr({x: 20, y: 105}).show("Master", [owl.input, owl.output]);
var INVENTORY_HUD_LABEL_W = 70;
Crafty.c("InventoryHud", {
    init: function() {
        this.requires("2D");
        this.inventories = [];
        this.parts = [];
        this.shown = true;
        this.bind("InventoryChanged", function (changed) {
            if (this.inventories.indexOf(changed) >= 0) {
                this.refresh();
            }
        });
        this.bind("Remove", function () {
            this.parts.forEach(function (part) { part.destroy(); });
        });
    },

    // Call after positioning with attr.
    show: function(label, inventories) {
        this.inventories = inventories;
        this.parts.push(Crafty.e("2D, HUD, Text")
            .attr({x: this.x, y: this.y, w: INVENTORY_HUD_LABEL_W, h: 40, z: 1000})
            .text(label)
            .textFont({size: '16px', weight: 'bold'}).textColor('#222').unselectable()
            .css({lineHeight: '40px'}));
        this.slots = [];
        var x = this.x + INVENTORY_HUD_LABEL_W;
        inventories.forEach(function (inventory) {
            for (var i = 0; i < inventory.capacity; i++) {
                var slot = Crafty.e("2D, HUD, Color").attr({x: x, y: this.y, w: 40, h: 40, z: 1000});
                this.parts.push(slot);
                var itemBox = Crafty.e("2D, HUD, Color").attr({z: 1001, visible: false});
                this.parts.push(itemBox);
                this.slots.push({box: slot, itemBox: itemBox, inventory: inventory, index: i});
                x += 50;
            }
        }, this);
        return this.refresh();
    },

    // Hides or shows the whole row; items only show while it is shown.
    enable: function(on) {
        this.shown = on;
        this.parts.forEach(function (part) { part.visible = on; });
        return this.refresh();
    },

    refresh: function() {
        this.slots.forEach(function (slot) {
            var item = slot.inventory.items[slot.index];
            var outlined = item && slot.inventory.items.length > 1 && slot.index === slot.inventory.selected;
            slot.box.color('#DDD');
            slot.itemBox.visible = this.shown && !!item;
            if (item) {
                var shape = ITEM_SHAPES[item.type];
                slot.itemBox.attr({w: shape.w, h: shape.h,
                    x: slot.box.x + (slot.box.w - shape.w) / 2, y: slot.box.y + (slot.box.h - shape.h) / 2});
                slot.itemBox.color(itemColor(item));
            }
            // Wedged clay gets a white outline.
            slot.itemBox.css({boxSizing: 'border-box', border: item && item.type === "clay" && item.clay.wedged ? '2px solid #FFF' : 'none'});
            slot.box.css({boxSizing: 'border-box', border: outlined ? '3px solid #FFF' : '3px solid #222'});
        }, this);
        return this;
    }
});
