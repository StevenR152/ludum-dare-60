// One HUD row: a label, then a grey square per slot of each inventory given. An item in a slot is
// drawn centred in it in its own colour or picture and shape (ITEM_SHAPES: clay square, pot a little wider than tall).
// The selected slot of an inventory with more than one item is outlined in white (options.outlined(inventory, index)
// decides instead, if given; options.watch lists more inventories whose changes redraw the row). A drying pot has a
// DryBar under its slot; a pot a red badge per firing (paintItem), wedged clay a border (markBorder).
// Redraws whenever one of its inventories changes, and as pots dry ("PotsDried").
//   Crafty.e("InventoryHud").attr({x: 20, y: 60}).show("Fox", [player.inventory]);
//   Crafty.e("InventoryHud").attr({x: 20, y: 105}).show("Master", [owl.inventory]);
var INVENTORY_HUD_LABEL_W = 70;
Crafty.c("InventoryHud", {
    init: function() {
        this.requires("2D");
        this.inventories = [];
        this.options = {};
        this.parts = [];
        this.shown = true;
        this.bind("InventoryChanged", function (changed) {
            if (this.inventories.indexOf(changed) >= 0 || (this.options.watch || []).indexOf(changed) >= 0) {
                this.refresh();
            }
        });
        this.bind("KilnStateChanged", function () {
            if (this.slots) {
                this.refresh();
            }
        });
        this.bind("PotsDried", this.refresh);
        this.bind("Remove", function () {
            this.parts.forEach(function (part) { part.destroy(); });
        });
    },

    // Call after positioning with attr.
    show: function(label, inventories, options) {
        this.inventories = inventories;
        this.options = options || {};
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
                var bar = new DryBar("HUD").place(x + 2, this.y + 34, 36, 1002);
                this.parts.push(bar);
                this.slots.push({box: slot, itemBox: itemBox, bar: bar, inventory: inventory, index: i});
                x += 50;
            }
        }, this);
        return this.refresh();
    },

    // Makes the slots pressable (mouse or touch): handler(inventory, index) runs on press, for any slot.
    onSlotPress: function(handler) {
        this.slots.forEach(function (slot) {
            slot.box.addComponent("Mouse").bind("MouseDown", function () {
                if (slot.box.visible) {
                    handler(slot.inventory, slot.index);
                }
            });
        });
        return this;
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
            var outlined = this.options.outlined ? !!item && this.options.outlined(slot.inventory, slot.index)
                : item && slot.inventory.items.length > 1 && slot.index === slot.inventory.selected;
            slot.box.color('#DDD');
            slot.itemBox.visible = this.shown && !!item;
            if (item) {
                var shape = ITEM_SHAPES[item.type];
                slot.itemBox.attr({w: shape.w, h: shape.h,
                    x: slot.box.x + (slot.box.w - shape.w) / 2, y: slot.box.y + (slot.box.h - shape.h) / 2});
            }
            paintItem(slot.itemBox, item);
            slot.bar.show(item, this.shown);
            markBorder(slot.itemBox, item);
            slot.box.css({boxSizing: 'border-box', border: outlined ? '3px solid #FFF' : '3px solid #222'});
        }, this);
        return this;
    }
});
