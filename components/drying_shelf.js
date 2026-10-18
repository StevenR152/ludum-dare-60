// The drying shelf: DRY_SLOTS places for unfired pots. Each pot put on dries for DRY_MS
// (it advances to "dried"); only dried pots can be taken back, and the kiln only takes dried pots.
//   var shelf = Crafty.e("DryingShelf").place(INSIDE_X + 1500, 330, 280, 160);
//   shelf.useWith(fox);   // puts the fox's selected pot on, or takes a dried one off
Crafty.c("DryingShelf", {
    init: function() {
        this.requires("Shelf, Delay");
        this.holdItems(DRY_SLOTS, {
            accepts: function (item) { return item.state === "thrown"; },
            releases: function (item) { return item.state === "dried"; }
        });
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.startDrying();
            }
        });
    },

    // Starts the clock on any pot that has just been put on.
    startDrying: function() {
        var shelf = this;
        this.inventory.items.forEach(function (pot) {
            if (pot.state === "thrown") {
                pot.advance("drying");
                shelf.delay(function () {
                    pot.advance("dried");
                    shelf.inventory.changed();
                }, DRY_MS, 0);
            }
        });
    },

    useWith: function(fox) {
        if (transferItem(fox.inventory, this.inventory)) {
            return;
        }
        var ready = this.inventory.items.findIndex(function (pot) { return pot.state === "dried"; });
        if (ready >= 0) {
            if (!transferItem(this.inventory, fox.inventory, ready)) {
                showStatus("You can't carry the pot: your pack is full or holds clay");
            }
            return;
        }
        var held = fox.inventory.selectedItem();
        if (held && held.state === "thrown") {
            showStatus("The drying shelf is full");
        } else if (this.inventory.items.length > 0) {
            showStatus("Nothing is dry yet");
        } else {
            showStatus("Bring an unfired pot to dry");
        }
    }
});
