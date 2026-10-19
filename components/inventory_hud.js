// One HUD row: a label, then a grey square per slot of each inventory given. An item in a slot is
// drawn centred in it in its own colour or picture and shape (ITEM_SHAPES: clay square, pot a little wider than tall).
// The selected slot of an inventory with more than one item is outlined in white (options.outlined(inventory, index)
// decides instead, if given; options.watch lists more inventories whose changes redraw the row). A drying pot has a
// DryBar under its slot; a pot a red badge per firing (paintItem), wedged clay a border (markBorder).
// Redraws whenever one of its inventories changes, and as pots dry ("PotsDried").
//   Crafty.e("InventoryHud").attr({x: 20, y: 60}).show("Fox", [player.inventory]);
//   Crafty.e("InventoryHud").attr({x: 20, y: 105}).show("Master", [owl.inventory]);
var INVENTORY_HUD_LABEL_W = 70;
var PACK_HINT_COLOR = "#FFC107";
var PACK_HINT_CYCLE_S = 0.6;
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
        this.bind("PackFullHint", function (ms) {
            if (this.options.hintFlash) {
                this.flashSelected(ms);
            }
        });
        this.bind("Remove", function () {
            this.stopFlash();
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
        // Slots run along the row and wrap onto a new line, under the first slot, where the panel runs out.
        var firstX = this.x + INVENTORY_HUD_LABEL_W;
        var x = firstX;
        var y = this.y;
        inventories.forEach(function (inventory) {
            for (var i = 0; i < inventory.capacity; i++) {
                if (x + 40 > HUD_PANEL_X + HUD_PANEL_W - 10) {
                    x = firstX;
                    y += 50;
                }
                var slot = Crafty.e("2D, HUD, Color").attr({x: x, y: y, w: 40, h: 40, z: 1000});
                this.parts.push(slot);
                var itemBox = Crafty.e("2D, HUD, Color").attr({z: 1001, visible: false});
                this.parts.push(itemBox);
                var bar = new DryBar("HUD").place(x + 2, y + 34, 36, 1002);
                this.parts.push(bar);
                this.slots.push({box: slot, itemBox: itemBox, bar: bar, inventory: inventory, index: i});
                x += 50;
            }
        }, this);
        this.h = y + 40 - this.y;
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

    // Pulses a golden border on the selected slot (it follows the selection) for ms, to say a press there drops it.
    // Ends early once the pack is no longer full, or when the row is hidden. Only rows made with options.hintFlash listen.
    flashSelected: function(ms) {
        if (!document.getElementById("packHintStyle")) {
            var style = document.createElement("style");
            style.id = "packHintStyle";
            style.textContent = "@keyframes packHintPulse {0%, 100% {box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);} 50% {box-shadow: 0 0 10px 4px " + PACK_HINT_COLOR + ";}}";
            document.head.appendChild(style);
        }
        this.stopFlash();
        this.flashing = true;
        this.flashTimer = setTimeout(this.stopFlash.bind(this), ms);
        return this.refresh();
    },

    stopFlash: function() {
        clearTimeout(this.flashTimer);
        if (this.flashing) {
            this.flashing = false;
            if (this.slots) {
                this.refresh();
            }
        }
    },

    // Hides or shows the whole row; items only show while it is shown.
    enable: function(on) {
        this.shown = on;
        if (!on) {
            this.stopFlash();
        }
        this.parts.forEach(function (part) { part.visible = on; });
        return this.refresh();
    },

    refresh: function() {
        if (this.flashing && !this.inventories.every(function (inventory) { return inventory.items.length >= inventory.capacity; })) {
            this.flashing = false;
            clearTimeout(this.flashTimer);
        }
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
            var hinted = this.flashing && !!item && slot.index === slot.inventory.selected;
            slot.box.css({boxSizing: 'border-box', border: hinted ? '3px solid ' + PACK_HINT_COLOR : outlined ? '3px solid #FFF' : '3px solid #222',
                animation: hinted ? 'packHintPulse ' + PACK_HINT_CYCLE_S + 's ease-in-out infinite' : 'none'});
        }, this);
        return this;
    }
});
