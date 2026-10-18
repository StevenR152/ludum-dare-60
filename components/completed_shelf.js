// The completed shelf: COMPLETED_CAPACITY places for finished pots, which stay for good.
// For now a fired pot counts as finished; glaze will tighten this. When it is full the shelf
// triggers "OrdersComplete" once, which the Game scene turns into the end of the game.
//   var shelf = Crafty.e("CompletedShelf").place(INSIDE_X + 1500, 700, 300, 160);
//   shelf.useWith(fox);   // puts the fox's selected fired pot on
Crafty.c("CompletedShelf", {
    init: function() {
        this.requires("Shelf, Delay");
        this.holdItems(COMPLETED_CAPACITY, {
            accepts: function (item) { return item.state === "cooled" && !item.pot.cracked; },
            releases: function () { return false; }
        });
        this.bind("InventoryChanged", function (changed) {
            if (changed !== this.inventory) {
                return;
            }
            this.inventory.items.forEach(function (pot) {
                if (pot.state === "cooled") {
                    pot.advance("shelved");
                }
            });
            if (this.inventory.items.length >= COMPLETED_CAPACITY) {
                this.trigger("OrdersComplete");
            }
        });
    },

    useWith: function(fox) {
        if (transferItem(fox.inventory, this.inventory)) {
            showStatus(this.inventory.items.length + " of " + COMPLETED_CAPACITY + " pots completed");
            return;
        }
        var held = fox.inventory.selectedItem();
        showStatus(held && held.type === "pot" && held.pot.cracked
            ? "Cracked pots can't go on the shelf"
            : held && held.type === "pot" && held.before("cooled")
            ? "Only fired pots go on the completed shelf"
            : this.inventory.items.length >= COMPLETED_CAPACITY
                ? "The completed shelf is full"
                : "Bring a fired pot to put here");
    }
});
