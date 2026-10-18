// The Game scene's HUD as one thing: a faint panel holding the music button, the timer and the
// Fox / Master / Kiln inventory rows. It owns them all, so one call shows or hides the lot.
//   var hud = Crafty.e("GameHud").build(player, owl, kiln);
//   hud.enable(false);   // hide and disable the whole HUD; hud.enable(true) brings it back
// The timer keeps counting while the HUD is hidden.
Crafty.c("GameHud", {
    init: function() {
        this.requires("2D");
        this.parts = [];
        this.rows = [];
    },

    // Call once the fox, owl and kiln exist.
    build: function(fox, owl, kiln) {
        this.parts.push(Crafty.e("2D, HUD, Color")
            .attr({x: 10, y: 10, w: 430, h: 200, z: 999})
            .color("rgba(255, 255, 255, 0.8)")
            .css({borderRadius: "8px"}));
        this.parts.push(Crafty.e("MuteButton").attr({x: 20, y: 20}));
        this.parts.push(Crafty.e("GameTimer").attr({x: 125, y: 20}));
        this.addRow("Fox", [fox.inventory], 60);
        this.addRow("Master", [owl.input, owl.output], 110);
        this.addRow("Kiln", [kiln.inventory, kiln.woodInventory], 160);
        this.bind("Remove", function () {
            this.parts.concat(this.rows).forEach(function (part) { part.destroy(); });
        });
        return this;
    },

    addRow: function(label, inventories, y) {
        this.rows.push(Crafty.e("InventoryHud").attr({x: 20, y: y}).show(label, inventories));
    },

    enable: function(on) {
        this.parts.forEach(function (part) { part.visible = on; });
        this.rows.forEach(function (row) { row.enable(on); });
        return this;
    }
});
