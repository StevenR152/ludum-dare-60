// HUD slot showing what the fox carries (gameState.heldItem).
// Refreshes on Crafty.trigger("InventoryChanged").
Crafty.c("InventorySlot", {
    init: function() {
        this.requires("2D, HUD, Color");
        this.attr({w: 50, h: 50, z: 1000});
        this.css({border: '3px solid #222', boxSizing: 'border-box'});
        this.bind("InventoryChanged", this.refresh);
        this.refresh();
    },

    refresh: function() {
        this.color(gameState.heldItem ? POT_COLOR : '#DDD');
        return this;
    }
});
