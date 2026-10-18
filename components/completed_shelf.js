// The completed shelf, where customers pick up: COMPLETED_CAPACITY places for finished pots (glazed or
// not, through their glaze firing: "glazeCooled"), which stay for good. When it is full the shelf
// triggers "OrdersComplete" once, which the Game scene turns into the end of the game.
//   var shelf = Crafty.e("CompletedShelf").place(INSIDE_X + 1500, 700, 300, 160);
//   shelf.useWith(fox);   // puts the fox's selected glaze-fired pot on
Crafty.c("CompletedShelf", {
    init: function() {
        this.requires("Shelf, Delay");
        this.holdItems(COMPLETED_CAPACITY, {
            accepts: function (item) { return item.state === "glazeCooled"; },
            releases: function () { return false; }
        });
        this.bind("InventoryChanged", function (changed) {
            if (changed !== this.inventory) {
                return;
            }
            this.inventory.items.forEach(function (pot) {
                if (pot.state === "glazeCooled") {
                    pot.advance("shelved");
                }
            });
            if (this.inventory.items.length >= this.inventory.capacity) {
                this.trigger("OrdersComplete");
            }
        });
    },

    // Levels set how many pots end them (default COMPLETED_CAPACITY). Call before place().
    //   Crafty.e("CompletedShelf").goal(1).place(...)
    goal: function(pots) {
        this.inventory.capacity = pots;
        return this;
    },

    useWith: function(fox) {
        if (transferItem(fox.inventory, this.inventory)) {
            showStatus(this.inventory.items.length + " of " + this.inventory.capacity + " pots completed");
            return;
        }
        var held = fox.inventory.selectedItem();
        showStatus(held && held.type === "pot" && held.before("glazeCooled")
            ? "Fire the pot a second time (glazed or not) first"
            : this.inventory.items.length >= this.inventory.capacity
                ? "The completed shelf is full"
                : "Bring a finished pot to put here");
    }
});
