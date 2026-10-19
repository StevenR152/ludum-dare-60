// The completed shelf, where finished pots (glazed or not, through their glaze firing: "glazeCooled") wait
// for a customer: COMPLETED_CAPACITY places. A cracked pot is refused. A pot that fills an open order (see
// findOpenOrder) is delivered at once and leaves the shelf; one that fills none waits, and the fox can take it
// back. A waiting pot is delivered the moment a matching order arrives. The ORDERS_TO_WIN-th delivered order
// triggers "OrdersComplete" once, which the Game scene turns into the end of the game.
//   var shelf = Crafty.e("CompletedShelf").place(INSIDE_X + 1500, 700, 300, 160);
//   shelf.useWith(fox);   // puts the fox's selected glaze-fired pot on, or takes a waiting pot off
Crafty.c("CompletedShelf", {
    init: function() {
        this.requires("Shelf, Delay");
        this.holdItems(COMPLETED_CAPACITY, {
            accepts: function (item) { return item.state === "glazeCooled" && !item.pot.cracked; }
        });
        this.over = false;
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.deliverWaiting();
            }
        });
        this.bind("OrderAdded", this.deliverWaiting);
    },

    // Every waiting pot that fills an open order goes to it, oldest pot and oldest order first.
    deliverWaiting: function() {
        var pots = this.inventory.items.slice();
        var delivered = false;
        pots.forEach(function (pot) {
            var order = findOpenOrder(pot);
            if (order) {
                this.inventory.pull(this.inventory.items.indexOf(pot));
                pot.advance("shelved");
                deliverOrder(order);
                delivered = true;
            }
        }, this);
        if (!delivered) {
            return;
        }
        this.inventory.changed();
        if (!this.over && gameState.orders.filter(function (order) { return order.delivered; }).length >= ORDERS_TO_WIN) {
            this.over = true;
            this.trigger("OrdersComplete");
        }
    },

    useWith: function(fox) {
        var held = fox.inventory.selectedItem();
        if (held && held.type === "pot" && held.pot.cracked) {
            showStatus("Broken pots can't be delivered");
            return;
        }
        if (transferItem(fox.inventory, this.inventory)) {
            showStatus(this.inventory.items.indexOf(held) >= 0 ? "No order wants this pot yet: take it back to make room" : "Order delivered!");
            return;
        }
        if (held && held.type === "pot" && held.before("glazeCooled")) {
            showStatus("Fire the pot a second time (glazed or not) first");
        } else if (held) {
            showStatus(this.inventory.items.length >= COMPLETED_CAPACITY ? "The completed shelf is full" : "Bring a finished pot to put here");
        } else if (this.inventory.items.length > 0) {
            if (!transferItem(this.inventory, fox.inventory, 0)) {
                showStatus("You can't carry the pot: your pack is full");
            }
        } else {
            showStatus("Bring a finished pot to put here");
        }
    }
});
