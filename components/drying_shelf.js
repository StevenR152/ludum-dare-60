// The drying shelf: DRY_SLOTS places for unfired pots, where they dry fastest (see PotDrier). Pots can
// be taken off at any dryness: wet, leather hard (ready for the owl to trim) or bone dry (ready for the
// kiln). Each slot shows a DryBar and the pot's stage under it. Clicking a pot's box triggers
// "SlotClicked" with its index, so the fox can take that one.
//   var shelf = Crafty.e("DryingShelf").place(INSIDE_X + 1500, 330, 280, 160);
//   shelf.useWith(fox);      // puts the fox's selected pot on, or takes the driest one off
//   shelf.takeAt(fox, 1);    // takes the pot in slot 1
Crafty.c("DryingShelf", {
    init: function() {
        this.requires("Shelf");
        this.holdItems(DRY_SLOTS, {
            accepts: isDrying
        });
        this.bars = [];
        this.labels = [];
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.drawBars();
            }
        });
        this.bind("PotsDried", this.drawBars);
        this.bind("Remove", function () {
            this.bars.forEach(function (bar) { bar.destroy(); });
            this.labels.forEach(function (label) { label.destroy(); });
        });
    },

    place: function(x, y, w, h) {
        this.attr({x: x, y: y, w: w, h: h});
        this.drawSlots();
        return this.drawBars();
    },

    // Under each slot box (see Shelf.drawSlots): the bar, then "wet", "LH" or "dry".
    drawBars: function() {
        for (var i = 0; i < this.inventory.capacity; i++) {
            var x = this.x + 20 + i * 60;
            var y = this.y + (this.h - 40) / 2 + 46;
            if (!this.bars[i]) {
                this.slotBoxes[i].addComponent("Mouse").bind("Click", this.trigger.bind(this, "SlotClicked", i));
                this.bars[i] = new DryBar("DOM");
                this.labels[i] = Crafty.e("2D, DOM, Text")
                    .attr({w: 40, h: 16})
                    .textFont({size: '13px', weight: 'bold'}).textColor('#222').unselectable()
                    .css({textAlign: 'center'});
            }
            var pot = this.inventory.items[i];
            this.bars[i].place(x, y, 40, this.z + 1).show(pot);
            this.labels[i].attr({x: x, y: y + DRY_BAR_H + 2, z: this.z + 1, visible: !!pot})
                .text(pot ? DRY_STAGE_LABELS[pot.dryStage()] : "");
        }
        return this;
    },

    useWith: function(fox) {
        if (transferItem(fox.inventory, this.inventory)) {
            return;
        }
        var held = fox.inventory.selectedItem();
        if (isDrying(held)) {
            showStatus("The drying shelf is full");
            return;
        }
        if (held && held.type === "pot" && held.pot.cracked) {
            showStatus("This pot is cracked, it won't dry");
            return;
        }
        if (this.inventory.items.length === 0) {
            showStatus("Bring an unfired pot to dry");
            return;
        }
        var driest = 0;
        this.inventory.items.forEach(function (pot, i) {
            if (pot.pot.dryness > this.inventory.items[driest].pot.dryness) {
                driest = i;
            }
        }, this);
        this.takeAt(fox, driest);
    },

    takeAt: function(fox, index) {
        if (this.inventory.items[index] && !transferItem(this.inventory, fox.inventory, index)) {
            showStatus("You can't carry the pot: your pack is full");
        }
    }
});

// Dries every unfired pot each frame: those in `shelf` at full speed, those in `others` (the fox's pack,
// the owl's hands) and those on the ground OFF_SHELF_SLOWDOWN times slower. Pots in the kiln aren't listed, so they don't dry.
// Triggers "PotsDried" when any dryness changed, so the bars and HUD redraw.
//   Crafty.e("PotDrier").dry(dryingShelf.inventory, [player.inventory, owl.inventory]);
Crafty.c("PotDrier", {
    dry: function(shelf, others) {
        this.bind("UpdateFrame", function (frame) {
            var changed = false;
            var dryAll = function (inventory, slowdown) {
                inventory.items.forEach(function (item) {
                    if (item.type === "pot" && item.dry(frame.dt, slowdown)) {
                        changed = true;
                    }
                });
            };
            dryAll(shelf, 1);
            others.forEach(function (inventory) { dryAll(inventory, OFF_SHELF_SLOWDOWN); });
            // Pots on the ground dry like pots in the fox's pack.
            Crafty("DroppedItem").each(function () {
                if (this.item.type === "pot" && this.item.dry(frame.dt, OFF_SHELF_SLOWDOWN)) {
                    changed = true;
                }
            });
            if (changed) {
                Crafty.trigger("PotsDried");
            }
        });
        return this;
    }
});
